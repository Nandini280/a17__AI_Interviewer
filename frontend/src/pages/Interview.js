import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Brain, 
  Clock, 
  X, 
  Mic, 
  MicOff, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  AlertCircle,
  SkipForward,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : (process.env.NODE_ENV === 'production' ? 'https://a17-backend.vercel.app/api' : '/api');

const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answerType, setAnswerType] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [questionStatus, setQuestionStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [skills, setSkills] = useState([]);
  
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchInterview();
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const fetchInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/interview/${id}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterview(response.data);
      
      // Fetch skills
      const resumeRes = await axios.get(`${API_URL}/resume`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resumeRes.data.skills) {
        setSkills(resumeRes.data.skills);
      }
    } catch (error) {
      alert('Error loading interview');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      loadPreviousAnswer(currentQuestion - 1);
    }
  };

  const handleNext = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/interview/${id}/answer`, {
        questionIndex: currentQuestion,
        answerText: answer,
        answerType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setQuestionStatus(prev => ({
        ...prev,
        [currentQuestion]: 'answered'
      }));

      if (currentQuestion < 4) {
        setCurrentQuestion(prev => prev + 1);
        setAnswer('');
        setTranscribedText('');
      } else {
        handleFinish();
      }
    } catch (error) {
      alert('Error submitting answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion]: 'skipped'
    }));
    
    if (currentQuestion < 4) {
      setCurrentQuestion(prev => prev + 1);
      setAnswer('');
      setTranscribedText('');
    } else {
      handleFinish();
    }
  };

  const loadPreviousAnswer = async (index) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/interview/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingAnswer = response.data.answers.find(a => 
        a.questionText === interview.questions[index]?.questionText
      );
      if (existingAnswer) {
        setAnswer(existingAnswer.answerText);
      } else {
        setAnswer('');
        setTranscribedText('');
      }
    } catch (error) {
      console.error('Error loading previous answer');
    }
  };

  const handleFinish = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/interview/${id}/finish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/results/${id}`);
    } catch (error) {
      alert('Error finishing interview');
    }
  };

const recordingTimerRef = useRef(null);

let accumulatedTranscript = '';
  let silenceTimer = null;

  const startRecording = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge for voice recording.');
      return;
    }

    const restartRecognition = () => {
      if (recognitionRef.current && isRecording) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignore if already started
        }
      }
    };

    try {
      recognitionRef.current = new SpeechRecognition();
      // Use non-continuous mode for better compatibility
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      // Handle recognition results (both interim and final)
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Clear silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
        
        // Show interim results while speaking
        if (interimTranscript) {
          const currentText = accumulatedTranscript + interimTranscript;
          setTranscribedText(currentText);
          setAnswer(currentText);
        }
        
        // Update with final transcript when speech is recognized
        if (finalTranscript) {
          accumulatedTranscript += finalTranscript + ' ';
          setTranscribedText(accumulatedTranscript.trim());
          setAnswer(accumulatedTranscript.trim());
          
          // Auto-restart for continuous recording after short delay
          if (isRecording) {
            silenceTimer = setTimeout(() => {
              restartRecognition();
            }, 500);
          }
        }
      };

      // Handle errors
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't stop for no-speech, just restart
        if (event.error === 'no-speech' && isRecording) {
          console.log('No speech detected, restarting...');
          setTimeout(() => {
            if (isRecording) {
              restartRecognition();
            }
          }, 300);
          return;
        }
        
        setIsRecording(false);
        
        let errorMessage = 'Speech recognition error';
        switch (event.error) {
          case 'audio-capture':
            errorMessage = 'Microphone not found. Please ensure your microphone is connected.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }
        
        if (event.error !== 'no-speech') {
          alert(errorMessage);
        }
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
      };

      // Handle when recognition stops
      recognitionRef.current.onend = () => {
        // Only restart if we're still supposed to be recording
        if (isRecording) {
          setTimeout(() => {
            if (isRecording) {
              restartRecognition();
            }
          }, 100);
        } else {
          setIsRecording(false);
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
          }
        }
      };

      // Start recognition
      recognitionRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscribedText('');
      setAnswer('');
      accumulatedTranscript = '';
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Failed to start speech recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    
    // Clear recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const getStatusColor = (index) => {
    if (index === currentQuestion) return '#2563EB';
    if (questionStatus[index] === 'answered') return '#10B981';
    if (questionStatus[index] === 'skipped') return '#F59E0B';
    return '#94a3b8';
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return '#10B981';
    if (difficulty === 'Medium') return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading interview...</p>
      </div>
    );
  }

  const currentQ = interview?.questions?.[currentQuestion];

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <header style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.logo}>
            <Brain style={{ color: '#2563EB', marginRight: '8px' }} />
            <span style={styles.logoText}>AI Interviewer</span>
          </div>
        </div>
        
        <div style={styles.topBarCenter}>
          <div style={styles.timer}>
            <Clock size={18} style={{ marginRight: '8px' }} />
            {formatTime(elapsedTime)}
          </div>
          <div style={styles.questionCounter}>
            Question {currentQuestion + 1} of 5
          </div>
        </div>

        <div style={styles.topBarRight}>
          <button 
            onClick={() => setShowExitConfirm(true)}
            style={styles.exitBtn}
          >
            <X size={18} style={{ marginRight: '6px' }} />
            Exit
          </button>
        </div>
      </header>

      <div style={styles.mainContent}>
        {/* Left Panel */}
        <aside style={styles.leftPanel}>
          <h3 style={styles.panelTitle}>Your Resume Profile</h3>
          
          <div style={styles.skillsSection}>
            <h4 style={styles.sectionLabel}>Identified Skills</h4>
            <div style={styles.skillsList}>
              {skills.slice(0, 10).map((skill, index) => (
                <span 
                  key={index} 
                  style={currentQ?.skill === skill ? {...styles.skillTag, ...styles.skillTagActive} : styles.skillTag}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.progressSection}>
            <h4 style={styles.sectionLabel}>Interview Progress</h4>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${((currentQuestion + 1) / 5) * 100}%`
                }}
              ></div>
            </div>
            <p style={styles.progressText}>{Math.round(((currentQuestion + 1) / 5) * 100)}% Complete</p>
          </div>
        </aside>

        {/* Right Panel */}
        <main style={styles.rightPanel}>
          {/* Question Area */}
          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={styles.questionCard}
          >
            <div style={styles.questionHeader}>
              <span style={styles.categoryBadge}>{currentQ?.category}</span>
              <span style={{...styles.difficultyBadge, backgroundColor: getDifficultyColor(currentQ?.difficulty)}}>
                {currentQ?.difficulty}
              </span>
            </div>
            
            <h2 style={styles.questionText}>{currentQ?.questionText}</h2>
          </motion.div>

          {/* Answer Input */}
          <div style={styles.answerSection}>
            <div style={styles.tabs}>
              <button 
                onClick={() => setAnswerType('text')}
                style={answerType === 'text' ? {...styles.tab, ...styles.tabActive} : styles.tab}
              >
                Type Answer
              </button>
              <button 
                onClick={() => setAnswerType('voice')}
                style={answerType === 'voice' ? {...styles.tab, ...styles.tabActive} : styles.tab}
              >
                <Mic size={16} style={{ marginRight: '6px' }} />
                Record Voice
              </button>
            </div>

            {answerType === 'text' ? (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                style={styles.textarea}
              />
            ) : (
              <div style={styles.voiceSection}>
                <div style={styles.voiceControls}>
                  {!isRecording ? (
                    <button onClick={startRecording} style={styles.recordBtn}>
                      <Mic size={20} style={{ marginRight: '8px' }} />
                      Start Recording
                    </button>
                  ) : (
                    <button onClick={stopRecording} style={styles.stopBtn}>
                      <MicOff size={20} style={{ marginRight: '8px' }} />
                      Stop Recording ({recordingTime}s)
                    </button>
                  )}
                </div>
                {isRecording && (
                  <div style={styles.recordingIndicator}>
                    <span style={styles.recordingDot}></span>
                    Recording...
                  </div>
                )}
                {transcribedText && (
                  <div style={styles.transcribedText}>
                    <p style={styles.transcribedLabel}>Transcribed Text:</p>
                    <p>{transcribedText}</p>
                  </div>
                )}
                <p style={styles.voiceNote}>Click record and speak your answer clearly</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={styles.navigation}>
            <button 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              style={currentQuestion === 0 ? {...styles.navBtn, ...styles.navBtnDisabled} : styles.navBtn}
            >
              <ChevronLeft size={20} style={{ marginRight: '4px' }} />
              Previous
            </button>

            <button onClick={handleSkip} style={styles.skipBtn}>
              <SkipForward size={18} style={{ marginRight: '4px' }} />
              Skip
            </button>

            <button 
              onClick={handleNext}
              disabled={submitting}
              style={submitting ? {...styles.navBtn, ...styles.submitBtnDisabled} : styles.submitBtn}
            >
              {submitting ? 'Submitting...' : currentQuestion === 4 ? 'Finish Interview' : 'Next'}
              {currentQuestion < 4 && <ChevronRight size={20} style={{ marginLeft: '4px' }} />}
            </button>
          </div>
        </main>
      </div>

      {/* Bottom Status Bar */}
      <div style={styles.statusBar}>
        {interview?.questions?.map((q, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentQuestion(index);
              loadPreviousAnswer(index);
            }}
            style={{
              ...styles.statusItem,
              backgroundColor: getStatusColor(index),
              color: index === currentQuestion ? 'white' : 'white'
            }}
          >
            {questionStatus[index] === 'answered' && <CheckCircle size={14} style={{ marginRight: '4px' }} />}
            {questionStatus[index] === 'skipped' && <SkipForward size={14} style={{ marginRight: '4px' }} />}
            {index + 1}
          </button>
        ))}
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Exit Interview?</h3>
            <p>Are you sure you want to exit? Your progress will be lost.</p>
            <div style={styles.modalBtns}>
              <button onClick={() => setShowExitConfirm(false)} style={styles.modalCancelBtn}>
                Continue Interview
              </button>
              <button onClick={() => navigate('/dashboard')} style={styles.modalExitBtn}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0F0F1A',
    display: 'flex',
    flexDirection: 'column'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    color: '#94A3B8'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #2E2E4A',
    borderTopColor: '#8B5CF6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#16162A',
    borderBottom: '1px solid #2E2E4A'
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.25rem',
    fontWeight: '700'
  },
  logoText: {
    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  topBarCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#F8FAFC'
  },
  questionCounter: {
    padding: '0.5rem 1rem',
    backgroundColor: '#8B5CF620',
    color: '#A78BFA',
    borderRadius: '8px',
    fontWeight: '500'
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center'
  },
  exitBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    backgroundColor: '#EF444420',
    color: '#EF4444',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  mainContent: {
    display: 'flex',
    flex: '1',
    padding: '2rem',
    gap: '2rem'
  },
  leftPanel: {
    width: '280px',
    backgroundColor: '#16162A',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    height: 'fit-content',
    border: '1px solid #2E2E4A'
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: '1.5rem'
  },
  skillsSection: {
    marginBottom: '2rem'
  },
  sectionLabel: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  skillTag: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#1E1E3A',
    color: '#A78BFA',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '500',
    border: '1px solid #2E2E4A'
  },
  skillTagActive: {
    backgroundColor: '#8B5CF6',
    color: 'white'
  },
  progressSection: {},
  progressBar: {
    height: '8px',
    backgroundColor: '#2E2E4A',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: '4px',
    transition: 'width 0.3s'
  },
  progressText: {
    fontSize: '0.85rem',
    color: '#94A3B8',
    marginTop: '0.5rem',
    textAlign: 'center'
  },
  rightPanel: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  questionCard: {
    backgroundColor: '#16162A',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    border: '1px solid #2E2E4A'
  },
  questionHeader: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  categoryBadge: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#8B5CF620',
    color: '#A78BFA',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  difficultyBadge: {
    padding: '0.375rem 0.75rem',
    color: 'white',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  questionText: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#F8FAFC',
    lineHeight: '1.5'
  },
  answerSection: {
    backgroundColor: '#16162A',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    border: '1px solid #2E2E4A'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #2E2E4A',
    borderRadius: '8px',
    color: '#94A3B8',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    color: 'white'
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '1rem',
    border: '1px solid #2E2E4A',
    borderRadius: '8px',
    fontSize: '1rem',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#1E1E3A',
    color: '#F8FAFC'
  },
  voiceSection: {
    padding: '1rem 0'
  },
  voiceControls: {
    marginBottom: '1rem'
  },
  recordBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  stopBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#64748B',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#EF4444',
    fontWeight: '500',
    marginBottom: '1rem'
  },
  recordingDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#EF4444',
    borderRadius: '50%',
    animation: 'pulse 1s infinite'
  },
  transcribedText: {
    padding: '1rem',
    backgroundColor: '#1E1E3A',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  transcribedLabel: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: '0.5rem'
  },
  voiceNote: {
    fontSize: '0.875rem',
    color: '#64748B'
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem'
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.875rem 1.5rem',
    backgroundColor: '#16162A',
    border: '1px solid #2E2E4A',
    borderRadius: '8px',
    color: '#F8FAFC',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  navBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  skipBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.875rem 1.5rem',
    backgroundColor: '#F59E0B20',
    border: 'none',
    borderRadius: '8px',
    color: '#F59E0B',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.875rem 2rem',
    backgroundColor: '#8B5CF6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitBtnDisabled: {
    backgroundColor: '#64748B',
    cursor: 'not-allowed'
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#16162A',
    borderTop: '1px solid #2E2E4A'
  },
  statusItem: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#16162A',
    padding: '2rem',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '90%',
    border: '1px solid #2E2E4A',
    color: '#F8FAFC'
  },
  modalBtns: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  modalCancelBtn: {
    flex: '1',
    padding: '0.75rem',
    backgroundColor: '#8B5CF6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  modalExitBtn: {
    flex: '1',
    padding: '0.75rem',
    backgroundColor: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default Interview;

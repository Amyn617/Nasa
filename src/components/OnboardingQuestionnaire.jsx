import React, { useState } from 'react'

const USE_CASES = [
  {
    id: 'agriculture',
    title: '🌾 Agriculture & Farming',
    description: 'Crop planning, irrigation management, harvest timing',
    parameters: ['temperature', 'precipitation', 'humidity', 'wind_speed']
  },
  {
    id: 'outdoor',
    title: '🏃 Outdoor Activities',
    description: 'Hiking, sports, events, recreation planning',
    parameters: ['temperature', 'precipitation', 'wind_speed', 'cloud_cover']
  },
  {
    id: 'energy',
    title: '⚡ Energy & Utilities',
    description: 'Solar power, wind energy, load forecasting',
    parameters: ['solar_radiation', 'wind_speed', 'temperature', 'cloud_cover']
  },
  {
    id: 'research',
    title: '🔬 Research & Academia',
    description: 'Climate studies, environmental research, data analysis',
    parameters: ['temperature', 'precipitation', 'pressure', 'humidity', 'wind_speed']
  },
  {
    id: 'aviation',
    title: '✈️ Aviation & Transportation',
    description: 'Flight planning, logistics, safety management',
    parameters: ['wind_speed', 'pressure', 'visibility', 'temperature']
  },
  {
    id: 'other',
    title: '📊 Other Applications',
    description: 'Custom use case or general weather monitoring',
    parameters: ['temperature', 'precipitation', 'wind_speed']
  }
]

const ACTIVITY_TYPES = [
  {
    id: 'daily_monitoring',
    title: 'Daily Monitoring',
    description: 'Regular weather checks for daily activities'
  },
  {
    id: 'project_planning',
    title: 'Project Planning',
    description: 'Weather data for specific projects or events'
  },
  {
    id: 'trend_analysis',
    title: 'Trend Analysis',
    description: 'Historical data analysis and pattern identification'
  },
  {
    id: 'alerts_notifications',
    title: 'Alerts & Notifications',
    description: 'Real-time alerts for weather conditions'
  }
]

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    title: '🌱 Beginner',
    description: 'New to weather data and analysis',
    features: ['Simple visualizations', 'Guided tutorials', 'Basic parameters']
  },
  {
    id: 'intermediate',
    title: '📈 Intermediate',
    description: 'Some experience with weather data',
    features: ['Advanced charts', 'Data comparisons', 'Custom time ranges']
  },
  {
    id: 'advanced',
    title: '🎯 Advanced',
    description: 'Expert user with specific requirements',
    features: ['Raw data access', 'API integration', 'Advanced analytics']
  }
]

const DASHBOARD_PREFERENCES = [
  { id: 'quick_overview', title: 'Quick Overview Cards', description: 'Summary cards with key metrics' },
  { id: 'detailed_charts', title: 'Detailed Charts', description: 'In-depth visualizations and trends' },
  { id: 'comparison_tools', title: 'Comparison Tools', description: 'Compare different locations or time periods' },
  { id: 'export_features', title: 'Data Export', description: 'Download data in various formats' },
  { id: 'alert_center', title: 'Alert Center', description: 'Manage weather alerts and notifications' },
  { id: 'favorites', title: 'Saved Locations', description: 'Quick access to frequently used locations' }
]

export default function OnboardingQuestionnaire({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({
    useCase: null,
    activityType: null,
    experienceLevel: null,
    dashboardPreferences: [],
    notifications: {
      email: false,
      sms: false,
      calendar: false
    },
    calendarIntegration: false
  })

  const steps = [
    {
      title: "What's your primary use case?",
      subtitle: "Help us understand how you'll use weather data",
      component: UseCaseStep
    },
    {
      title: "What type of activities do you do?",
      subtitle: "This helps us personalize your experience",
      component: ActivityTypeStep
    },
    {
      title: "What's your experience level?",
      subtitle: "We'll customize the interface complexity for you",
      component: ExperienceLevelStep
    },
    {
      title: "How would you like your dashboard?",
      subtitle: "Choose features that matter most to you",
      component: DashboardPreferencesStep
    },
    {
      title: "Stay informed with notifications",
      subtitle: "Connect your calendar and set up alerts",
      component: NotificationStep
    }
  ]

  function updateAnswer(field, value) {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(answers)
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep]
  const StepComponent = currentStepData.component

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Step {currentStep + 1} of {steps.length}
            </span>
            <button 
              onClick={onSkip}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#666', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Skip for now
            </button>
          </div>
          <div style={{ 
            height: '4px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#667eea',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Step Content */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#333' }}>
            {currentStepData.title}
          </h2>
          <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '16px' }}>
            {currentStepData.subtitle}
          </p>
          
          <StepComponent 
            answers={answers}
            updateAnswer={updateAnswer}
          />
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: '12px 24px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              color: currentStep === 0 ? '#ccc' : '#333',
              borderRadius: '6px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <button
            onClick={nextStep}
            style={{
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

function UseCaseStep({ answers, updateAnswer }) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {USE_CASES.map(useCase => (
        <div
          key={useCase.id}
          onClick={() => updateAnswer('useCase', useCase.id)}
          style={{
            padding: '16px',
            border: `2px solid ${answers.useCase === useCase.id ? '#667eea' : '#e0e0e0'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: answers.useCase === useCase.id ? '#f0f4ff' : 'white',
            transition: 'all 0.2s ease'
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{useCase.title}</h4>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>{useCase.description}</p>
        </div>
      ))}
    </div>
  )
}

function ActivityTypeStep({ answers, updateAnswer }) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {ACTIVITY_TYPES.map(activity => (
        <div
          key={activity.id}
          onClick={() => updateAnswer('activityType', activity.id)}
          style={{
            padding: '16px',
            border: `2px solid ${answers.activityType === activity.id ? '#667eea' : '#e0e0e0'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: answers.activityType === activity.id ? '#f0f4ff' : 'white',
            transition: 'all 0.2s ease'
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{activity.title}</h4>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>{activity.description}</p>
        </div>
      ))}
    </div>
  )
}

function ExperienceLevelStep({ answers, updateAnswer }) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {EXPERIENCE_LEVELS.map(level => (
        <div
          key={level.id}
          onClick={() => updateAnswer('experienceLevel', level.id)}
          style={{
            padding: '16px',
            border: `2px solid ${answers.experienceLevel === level.id ? '#667eea' : '#e0e0e0'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: answers.experienceLevel === level.id ? '#f0f4ff' : 'white',
            transition: 'all 0.2s ease'
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{level.title}</h4>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>{level.description}</p>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Features: {level.features.join(' • ')}
          </div>
        </div>
      ))}
    </div>
  )
}

function DashboardPreferencesStep({ answers, updateAnswer }) {
  function togglePreference(prefId) {
    const current = answers.dashboardPreferences || []
    const updated = current.includes(prefId)
      ? current.filter(id => id !== prefId)
      : [...current, prefId]
    updateAnswer('dashboardPreferences', updated)
  }

  return (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
        Select all features you'd like to see in your dashboard:
      </p>
      <div style={{ display: 'grid', gap: '8px' }}>
        {DASHBOARD_PREFERENCES.map(pref => (
          <label
            key={pref.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: (answers.dashboardPreferences || []).includes(pref.id) ? '#f0f4ff' : 'white'
            }}
          >
            <input
              type="checkbox"
              checked={(answers.dashboardPreferences || []).includes(pref.id)}
              onChange={() => togglePreference(pref.id)}
              style={{ marginRight: '12px', marginTop: '2px' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{pref.title}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>{pref.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

function NotificationStep({ answers, updateAnswer }) {
  function updateNotifications(field, value) {
    updateAnswer('notifications', {
      ...answers.notifications,
      [field]: value
    })
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px 0' }}>Notification Preferences</h4>
        <div style={{ display: 'grid', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={answers.notifications?.email || false}
              onChange={(e) => updateNotifications('email', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span>📧 Email notifications for weather alerts</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={answers.notifications?.sms || false}
              onChange={(e) => updateNotifications('sms', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span>📱 SMS notifications for urgent weather conditions</span>
          </label>
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 12px 0' }}>Calendar Integration</h4>
        <div style={{ 
          padding: '16px', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={answers.calendarIntegration || false}
              onChange={(e) => updateAnswer('calendarIntegration', e.target.checked)}
              style={{ marginRight: '8px', marginTop: '2px' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                📅 Link to your calendar
              </div>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                Get weather updates for your scheduled events and receive proactive 
                notifications about weather conditions that might affect your plans.
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}
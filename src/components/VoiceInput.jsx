import React, { useEffect, useState } from 'react'

export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return setSupported(false)
    setSupported(true)
    const recog = new SpeechRecognition()
    recog.lang = 'en-US'
    recog.onresult = e => {
      const txt = e.results[0][0].transcript
      onResult(txt)
      setListening(false)
    }
    recog.onerror = () => setListening(false)

    if (listening) recog.start()
    return () => { try { recog.abort() } catch (e) {} }
  }, [listening])

  if (!supported) return <div>Voice input not supported in this browser</div>

  return (
    <div style={{ marginTop: 8 }}>
      <button className="btn" onClick={() => setListening(!listening)}>{listening ? 'Stop' : 'Speak'}</button>
    </div>
  )
}

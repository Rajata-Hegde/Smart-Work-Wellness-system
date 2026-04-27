import numpy as np

def EAR(eye):
    """Calculate Eye Aspect Ratio"""
    A = np.linalg.norm(np.array(eye[1]) - np.array(eye[5]))
    B = np.linalg.norm(np.array(eye[2]) - np.array(eye[4]))
    C = np.linalg.norm(np.array(eye[0]) - np.array(eye[3]))
    return (A + B) / (2.0 * C)

def analyze_session_eyes(session_data):
    """Analyze eye health metrics from a session"""
    if not session_data or 'eyeEvents' not in session_data:
        return {
            'avgBlinkRate': 0,
            'fatigueEvents': 0,
            'totalScreenTime': 0,
            'eyeHealthScore': 0
        }
    
    eye_events = session_data.get('eyeEvents', [])
    
    # Calculate average blink rate
    blink_rates = [event.get('blinkRate', 0) for event in eye_events if 'blinkRate' in event]
    avg_blink_rate = np.mean(blink_rates) if blink_rates else 0
    
    # Count fatigue events
    fatigue_events = sum(1 for event in eye_events if event.get('eyeFatigue', False))
    
    # Calculate total screen time in minutes
    total_screen_time = session_data.get('duration', 0)
    
    # Calculate eye health score (0-100)
    # Normal blink rate: 15-20 per minute
    blink_score = max(0, 100 - abs(avg_blink_rate - 17.5) * 5)
    
    # Fatigue penalty
    fatigue_penalty = min(30, fatigue_events * 5)
    
    # Screen time penalty (higher is worse)
    time_penalty = min(20, total_screen_time / 60 * 2) if total_screen_time > 0 else 0
    
    eye_health_score = max(0, min(100, blink_score - fatigue_penalty - time_penalty))
    
    return {
        'avgBlinkRate': round(avg_blink_rate, 2),
        'fatigueEvents': fatigue_events,
        'totalScreenTime': total_screen_time,
        'eyeHealthScore': round(eye_health_score, 2)
    }

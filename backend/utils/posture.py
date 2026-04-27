import sqlite3
import json
from datetime import datetime

DB_PATH = 'wellness_data.db'

def init_db():
    """Initialize the SQLite database if it doesn't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER,
        posture_score REAL,
        eye_score REAL,
        focus_score REAL,
        posture_log TEXT,
        blink_count INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def save_session(data):
    """Save a session record to the database"""
    init_db()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        INSERT INTO sessions 
        (timestamp, duration, posture_score, eye_score, focus_score, posture_log, blink_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('timestamp', datetime.now().isoformat()),
            data.get('duration', 0),
            data.get('postureScore', 0),
            data.get('eyeScore', 0),
            data.get('focusScore', 0),
            json.dumps(data.get('postureLog', [])),
            data.get('blinkCount', 0)
        ))
        
        conn.commit()
        session_id = cursor.lastrowid
        conn.close()
        
        return {
            'success': True,
            'sessionId': session_id,
            'message': 'Session saved successfully'
        }
    except Exception as e:
        conn.close()
        return {
            'success': False,
            'error': str(e)
        }

def get_history(limit=50):
    """Retrieve session history from the database"""
    init_db()
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT * FROM sessions 
        ORDER BY created_at DESC 
        LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        sessions = []
        
        for row in rows:
            session = {
                'id': row['id'],
                'timestamp': row['timestamp'],
                'duration': row['duration'],
                'postureScore': row['posture_score'],
                'eyeScore': row['eye_score'],
                'focusScore': row['focus_score'],
                'postureLog': json.loads(row['posture_log']) if row['posture_log'] else [],
                'blinkCount': row['blink_count'],
                'createdAt': row['created_at']
            }
            sessions.append(session)
        
        conn.close()
        return sessions
    except Exception as e:
        conn.close()
        return []

def compute_insights(records):
    """Analyze session records and generate insights"""
    if not records or len(records) < 2:
        return []
    
    insights = []
    
    # Analyze average posture score trend
    posture_scores = [s.get('postureScore', 0) for s in records if 'postureScore' in s]
    if posture_scores:
        avg_posture = sum(posture_scores) / len(posture_scores)
        if avg_posture < 60:
            insights.append('⚠️ Your average posture score is low. Focus on maintaining proper sitting position.')
        elif avg_posture >= 80:
            insights.append('✅ Great posture! Keep up the excellent form.')
    
    # Analyze eye health trend
    eye_scores = [s.get('eyeScore', 0) for s in records if 'eyeScore' in s]
    if eye_scores:
        avg_eye = sum(eye_scores) / len(eye_scores)
        if avg_eye < 60:
            insights.append('👁️ Your eye health score is below average. Try the 20-20-20 rule more often.')
        else:
            insights.append('👀 Good blink rate! Your eye health is well-maintained.')
    
    # Analyze focus trend
    focus_scores = [s.get('focusScore', 0) for s in records if 'focusScore' in s]
    if focus_scores:
        avg_focus = sum(focus_scores) / len(focus_scores)
        if avg_focus < 70:
            insights.append('🎯 Your focus score tends to be low. Try to minimize distractions.')
    
    # Analyze session duration trend
    durations = [s.get('duration', 0) for s in records if 'duration' in s]
    if durations and len(durations) > 1:
        avg_duration = sum(durations) / len(durations)
        if avg_duration > 120:
            insights.append('⏱️ You tend to have long sessions. Remember to take regular breaks!')
    
    # Analyze consistency
    if len(records) >= 7:
        insights.append(f'📅 Consistent user! You have {len(records)} tracked sessions.')
    
    return insights

from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.posture import init_db, save_session, get_history, compute_insights
from utils.eye import analyze_session_eyes
import json

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

@app.route('/api/session', methods=['POST'])
def create_session():
    """Save a wellness session to the database"""
    try:
        data = request.json
        
        # Validate required fields
        if not data or 'duration' not in data:
            return jsonify({'error': 'Invalid session data'}), 400
        
        result = save_session(data)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_session_history():
    """Retrieve all session history"""
    try:
        limit = request.args.get('limit', 50, type=int)
        sessions = get_history(limit)
        
        return jsonify({
            'success': True,
            'sessions': sessions,
            'count': len(sessions)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/insights', methods=['GET'])
def get_insights():
    """Generate AI insights from session history"""
    try:
        sessions = get_history(100)
        
        if not sessions:
            return jsonify({
                'success': True,
                'insights': ['Start tracking your wellness sessions to get personalized insights!']
            }), 200
        
        insights = compute_insights(sessions)
        
        return jsonify({
            'success': True,
            'insights': insights
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get aggregate statistics from all sessions"""
    try:
        sessions = get_history(100)
        
        if not sessions:
            return jsonify({
                'success': True,
                'stats': {
                    'totalSessions': 0,
                    'avgPostureScore': 0,
                    'avgEyeScore': 0,
                    'avgFocusScore': 0,
                    'totalScreenTime': 0
                }
            }), 200
        
        posture_scores = [s.get('postureScore', 0) for s in sessions]
        eye_scores = [s.get('eyeScore', 0) for s in sessions]
        focus_scores = [s.get('focusScore', 0) for s in sessions]
        durations = [s.get('duration', 0) for s in sessions]
        
        stats = {
            'totalSessions': len(sessions),
            'avgPostureScore': round(sum(posture_scores) / len(posture_scores), 2) if posture_scores else 0,
            'avgEyeScore': round(sum(eye_scores) / len(eye_scores), 2) if eye_scores else 0,
            'avgFocusScore': round(sum(focus_scores) / len(focus_scores), 2) if focus_scores else 0,
            'totalScreenTime': sum(durations)
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'SMART HEALTH Backend is running'
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)

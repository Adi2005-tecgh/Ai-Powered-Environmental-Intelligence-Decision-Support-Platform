import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

# Import and run the backend
if __name__ == "__main__":
    from backend.run import app
    
    # Ensure port is an integer
    port = int(os.environ.get('PORT', 5000))
    
    # Run server
    app.run(host='0.0.0.0', port=port, debug=True)

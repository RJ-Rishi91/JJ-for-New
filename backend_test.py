#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class JuniorJournalistAPITester:
    def __init__(self, base_url="https://young-reporter.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" - {response.text[:100]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_auth_flow(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication...")
        
        # Test registration
        timestamp = datetime.now().strftime("%H%M%S")
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!",
            "city": "Test City",
            "school": "Test School"
        }
        
        response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if response and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            
            # Test login
            login_response = self.run_test(
                "User Login",
                "POST", 
                "auth/login",
                200,
                data={"email": test_user["email"], "password": test_user["password"]}
            )
            
            # Test get current user
            self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200
            )
            
            # Test profile update
            self.run_test(
                "Update Profile",
                "PUT",
                "auth/profile",
                200,
                data={"bio": "Updated bio for testing"}
            )
            
            return True
        return False

    def test_submissions(self):
        """Test submission endpoints"""
        print("\n📝 Testing Submissions...")
        
        # Create submission
        submission_data = {
            "title": "Test Article",
            "content": "This is a test article content for API testing.",
            "type": "article",
            "category": "opinion"
        }
        
        response = self.run_test(
            "Create Submission",
            "POST",
            "submissions",
            200,
            data=submission_data
        )
        
        submission_id = None
        if response and 'id' in response:
            submission_id = response['id']
            
            # Get submission
            self.run_test(
                "Get Submission",
                "GET",
                f"submissions/{submission_id}",
                200
            )
            
            # List submissions
            self.run_test(
                "List Submissions",
                "GET",
                "submissions",
                200
            )
            
            # React to submission
            self.run_test(
                "React to Submission",
                "POST",
                f"submissions/{submission_id}/react?reaction=heart",
                200
            )
        
        return submission_id

    def test_events(self):
        """Test event endpoints"""
        print("\n📅 Testing Events...")
        
        # Create event
        event_data = {
            "title": "Test Workshop",
            "description": "A test workshop for API testing",
            "type": "workshop",
            "start_date": "2026-04-01T10:00:00Z",
            "end_date": "2026-04-01T12:00:00Z",
            "max_team": 10
        }
        
        response = self.run_test(
            "Create Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        
        event_id = None
        if response and 'id' in response:
            event_id = response['id']
            
            # Get event
            self.run_test(
                "Get Event",
                "GET",
                f"events/{event_id}",
                200
            )
            
            # List events
            self.run_test(
                "List Events",
                "GET",
                "events",
                200
            )
        
        return event_id

    def test_tasks(self, event_id):
        """Test task endpoints"""
        print("\n✅ Testing Tasks...")
        
        if not event_id:
            print("⚠️ Skipping task tests - no event ID available")
            return
        
        # Create task
        task_data = {
            "event_id": event_id,
            "title": "Test Task",
            "description": "A test task for API testing",
            "priority": "high"
        }
        
        response = self.run_test(
            "Create Task",
            "POST",
            "tasks",
            200,
            data=task_data
        )
        
        task_id = None
        if response and 'id' in response:
            task_id = response['id']
            
            # List tasks
            self.run_test(
                "List Tasks",
                "GET",
                f"tasks?event_id={event_id}",
                200
            )
            
            # Update task
            self.run_test(
                "Update Task",
                "PUT",
                f"tasks/{task_id}",
                200,
                data={"status": "in_progress"}
            )
            
            # Delete task
            self.run_test(
                "Delete Task",
                "DELETE",
                f"tasks/{task_id}",
                200
            )

    def test_general_endpoints(self):
        """Test general endpoints"""
        print("\n🌐 Testing General Endpoints...")
        
        # Homepage data
        self.run_test(
            "Homepage Data",
            "GET",
            "homepage",
            200
        )
        
        # Leaderboard
        self.run_test(
            "Leaderboard",
            "GET",
            "leaderboard",
            200
        )
        
        # Dashboard stats
        self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        # Opportunities
        self.run_test(
            "List Opportunities",
            "GET",
            "opportunities",
            200
        )
        
        # Resources
        self.run_test(
            "List Resources",
            "GET",
            "resources",
            200
        )
        
        # Rewards
        self.run_test(
            "List Rewards",
            "GET",
            "rewards",
            200
        )
        
        # Badges
        self.run_test(
            "List Badges",
            "GET",
            "badges",
            200
        )
        
        # User profile
        if self.user_id:
            self.run_test(
                "Get User Profile",
                "GET",
                f"users/{self.user_id}",
                200
            )

    def test_seed_data(self):
        """Test seed data endpoint"""
        print("\n🌱 Testing Seed Data...")
        
        self.run_test(
            "Seed Data",
            "POST",
            "seed",
            200
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Junior Journalist API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test seed data first
        self.test_seed_data()
        
        # Test authentication
        if not self.test_auth_flow():
            print("❌ Authentication failed, stopping tests")
            return False
        
        # Test submissions
        submission_id = self.test_submissions()
        
        # Test events
        event_id = self.test_events()
        
        # Test tasks (requires event)
        self.test_tasks(event_id)
        
        # Test general endpoints
        self.test_general_endpoints()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = JuniorJournalistAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
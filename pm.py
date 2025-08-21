#!/usr/bin/env python3
"""
PM Coordination Tools for Agent-Based Development
Simple scripts to manage epics, tickets, and agent coordination
"""

import json
import datetime
import os
import sys
from pathlib import Path

class ProjectManager:
    def __init__(self):
        self.status_file = "agent_status.json"
        self.ensure_status_file()
    
    def ensure_status_file(self):
        """Create status file if it doesn't exist"""
        if not os.path.exists(self.status_file):
            initial_data = {
                "project": {
                    "phase": "planning",
                    "current_sprint": "Setup",
                    "risks_status": "unknown"
                },
                "epics": [],
                "tickets": [],
                "agents": {}
            }
            self.save_status(initial_data)
    
    def load_status(self):
        """Load current project status"""
        with open(self.status_file, 'r') as f:
            return json.load(f)
    
    def save_status(self, data):
        """Save project status"""
        with open(self.status_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def create_epic(self, epic_id, name, description):
        """Create a new epic"""
        data = self.load_status()
        
        epic = {
            "id": epic_id,
            "name": name,
            "description": description,
            "status": "planned",
            "created": datetime.datetime.now().isoformat(),
            "tickets_total": 0,
            "tickets_complete": 0
        }
        
        data["epics"].append(epic)
        self.save_status(data)
        print(f"✅ Epic created: {epic_id} - {name}")
    
    def create_ticket(self, ticket_id, epic_id, title, agent, description=""):
        """Create a new ticket within an epic"""
        data = self.load_status()
        
        # Validate epic exists
        epic = next((e for e in data["epics"] if e["id"] == epic_id), None)
        if not epic:
            print(f"❌ Epic {epic_id} not found")
            return
        
        ticket = {
            "id": ticket_id,
            "title": title,
            "epic": epic_id,
            "assigned_to": agent,
            "status": "todo",
            "description": description,
            "created": datetime.datetime.now().isoformat(),
            "files": [],
            "feature_docs": f"docs/features.md#{title.lower().replace(' ', '-')}",
            "blocked_by": [],
            "dependencies": []
        }
        
        data["tickets"].append(ticket)
        
        # Update epic ticket count
        for e in data["epics"]:
            if e["id"] == epic_id:
                e["tickets_total"] += 1
                break
        
        self.save_status(data)
        print(f"🎫 Ticket created: {ticket_id} - {title} (assigned to {agent})")
    
    def assign_ticket(self, ticket_id, agent):
        """Assign ticket to an agent"""
        data = self.load_status()
        
        # Update ticket
        for ticket in data["tickets"]:
            if ticket["id"] == ticket_id:
                ticket["assigned_to"] = agent
                ticket["status"] = "assigned"
                break
        else:
            print(f"❌ Ticket {ticket_id} not found")
            return
        
        # Update agent status
        data["agents"][agent] = {
            "current_ticket": ticket_id,
            "status": "assigned",
            "last_update": datetime.datetime.now().isoformat()
        }
        
        self.save_status(data)
        print(f"👤 Ticket {ticket_id} assigned to {agent}")
    
    def start_ticket(self, ticket_id, agent):
        """Agent starts working on a ticket"""
        data = self.load_status()
        
        # Update ticket status
        for ticket in data["tickets"]:
            if ticket["id"] == ticket_id:
                if ticket["assigned_to"] != agent:
                    print(f"❌ Ticket {ticket_id} is assigned to {ticket['assigned_to']}, not {agent}")
                    return
                ticket["status"] = "in_progress"
                ticket["started"] = datetime.datetime.now().isoformat()
                break
        else:
            print(f"❌ Ticket {ticket_id} not found")
            return
        
        # Update agent status
        data["agents"][agent] = {
            "current_ticket": ticket_id,
            "status": "active",
            "last_update": datetime.datetime.now().isoformat()
        }
        
        self.save_status(data)
        print(f"🚀 {agent} started working on {ticket_id}")
        print(f"📝 Don't forget to update docs/features.md with progress!")
    
    def complete_ticket(self, ticket_id, agent, files_modified=None):
        """Agent completes a ticket"""
        data = self.load_status()
        
        # Update ticket
        for ticket in data["tickets"]:
            if ticket["id"] == ticket_id:
                if ticket["assigned_to"] != agent:
                    print(f"❌ Ticket {ticket_id} is assigned to {ticket['assigned_to']}, not {agent}")
                    return
                ticket["status"] = "dev_complete"
                ticket["completed"] = datetime.datetime.now().isoformat()
                if files_modified:
                    ticket["files"] = files_modified
                break
        else:
            print(f"❌ Ticket {ticket_id} not found")
            return
        
        # Update epic progress
        epic_id = ticket["epic"]
        for epic in data["epics"]:
            if epic["id"] == epic_id:
                epic["tickets_complete"] += 1
                break
        
        # Update agent status
        data["agents"][agent] = {
            "current_ticket": None,
            "status": "available",
            "last_update": datetime.datetime.now().isoformat()
        }
        
        self.save_status(data)
        print(f"✅ {agent} completed {ticket_id}")
        print(f"📝 Remember to update docs/features.md with final implementation details!")
    
    def show_status(self):
        """Display current project status"""
        data = self.load_status()
        
        print("\n📊 PROJECT STATUS")
        print("=" * 50)
        
        project = data["project"]
        print(f"Phase: {project['phase']}")
        print(f"Sprint: {project['current_sprint']}")
        print(f"Risk Status: {project['risks_status']}")
        
        print("\n📈 EPICS PROGRESS")
        print("-" * 30)
        for epic in data["epics"]:
            progress = epic["tickets_complete"] / max(epic["tickets_total"], 1) * 100
            status_emoji = "🟢" if epic["status"] == "complete" else "🟡" if epic["status"] == "in_progress" else "⚪"
            print(f"{status_emoji} {epic['id']}: {epic['name']} ({progress:.0f}% - {epic['tickets_complete']}/{epic['tickets_total']})")
        
        print("\n👥 AGENT STATUS")
        print("-" * 30)
        for agent_name, agent_data in data["agents"].items():
            status_emoji = "🟢" if agent_data["status"] == "active" else "🟡" if agent_data["status"] == "available" else "⚪"
            current_task = agent_data.get("current_ticket", "None")
            print(f"{status_emoji} {agent_name}: {agent_data['status']} | Current: {current_task}")
        
        print("\n🎫 ACTIVE TICKETS")
        print("-" * 30)
        active_tickets = [t for t in data["tickets"] if t["status"] in ["todo", "in_progress"]]
        if active_tickets:
            for ticket in active_tickets:
                status_emoji = "🔄" if ticket["status"] == "in_progress" else "📋"
                print(f"{status_emoji} {ticket['id']}: {ticket['title']} ({ticket['assigned_to']})")
        else:
            print("No active tickets")
    
    def show_risks(self):
        """Show risk status and remind to check RISKS.md"""
        if os.path.exists("docs/RISKS.md"):
            print("📋 Risk assessment file found: docs/RISKS.md")
            print("🔍 Please review risk status and update project status:")
            print("   python3 pm.py update_risk_status [green|yellow|red]")
        else:
            print("⚠️  No docs/RISKS.md file found!")
            print("📝 Create risk assessment first")
    
    def update_risk_status(self, status):
        """Update overall risk status"""
        if status not in ["green", "yellow", "red"]:
            print("❌ Risk status must be: green, yellow, or red")
            return
        
        data = self.load_status()
        data["project"]["risks_status"] = status
        self.save_status(data)
        
        emoji = "🟢" if status == "green" else "🟡" if status == "yellow" else "🔴"
        print(f"{emoji} Risk status updated to: {status}")

def main():
    pm = ProjectManager()
    
    if len(sys.argv) < 2:
        print("PM Coordination Tool")
        print("Commands:")
        print("  status                                    - Show project status")
        print("  epic <id> <n> <description>           - Create epic")
        print("  ticket <id> <epic_id> <title> <agent>    - Create ticket")
        print("  assign <ticket_id> <agent>               - Assign ticket")
        print("  start <ticket_id> <agent>                - Start ticket")
        print("  complete <ticket_id> <agent> [files]     - Complete ticket")
        print("  risks                                     - Show risk status")
        print("  update_risk_status <green|yellow|red>    - Update risk status")
        return
    
    command = sys.argv[1]
    
    if command == "status":
        pm.show_status()
    
    elif command == "epic":
        if len(sys.argv) < 5:
            print("Usage: python3 pm.py epic <id> <n> <description>")
            return
        pm.create_epic(sys.argv[2], sys.argv[3], " ".join(sys.argv[4:]))
    
    elif command == "ticket":
        if len(sys.argv) < 6:
            print("Usage: python3 pm.py ticket <id> <epic_id> <title> <agent>")
            return
        pm.create_ticket(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    
    elif command == "assign":
        if len(sys.argv) < 4:
            print("Usage: python3 pm.py assign <ticket_id> <agent>")
            return
        pm.assign_ticket(sys.argv[2], sys.argv[3])
    
    elif command == "start":
        if len(sys.argv) < 4:
            print("Usage: python3 pm.py start <ticket_id> <agent>")
            return
        pm.start_ticket(sys.argv[2], sys.argv[3])
    
    elif command == "complete":
        files = sys.argv[4:] if len(sys.argv) > 4 else None
        pm.complete_ticket(sys.argv[2], sys.argv[3], files)
    
    elif command == "risks":
        pm.show_risks()
    
    elif command == "update_risk_status":
        if len(sys.argv) < 3:
            print("Usage: python3 pm.py update_risk_status <green|yellow|red>")
            return
        pm.update_risk_status(sys.argv[2])
    
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
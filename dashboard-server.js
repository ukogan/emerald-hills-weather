// Dashboard server for agent management
// Provides API endpoints for the web dashboard

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3002; // Different port from weather API

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files including HTML

// Serve the dashboard HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'agent-dashboard.html'));
});

// API endpoint to get current project status
app.get('/api/status', async (req, res) => {
    try {
        // Read agent_status.json
        const statusData = await fs.readFile('./agent_status.json', 'utf8');
        const projectStatus = JSON.parse(statusData);
        
        // Read features.md for completed work details
        let featuresContent = '';
        try {
            featuresContent = await fs.readFile('./docs/features.md', 'utf8');
        } catch (err) {
            console.log('Features.md not found, using empty content');
        }
        
        // Format the response
        const response = {
            phase: projectStatus.project.phase,
            sprint: projectStatus.project.current_sprint,
            risk_status: projectStatus.project.risks_status,
            epics: projectStatus.epics.map(epic => ({
                id: epic.id,
                name: epic.name,
                progress: epic.tickets_total > 0 ? Math.round((epic.tickets_complete / epic.tickets_total) * 100) : 0,
                tickets_complete: epic.tickets_complete,
                tickets_total: epic.tickets_total,
                status: epic.status
            })),
            agents: projectStatus.agents,
            active_tickets: projectStatus.tickets.filter(t => t.status !== 'dev_complete').map(ticket => ({
                id: ticket.id,
                title: ticket.title,
                agent: ticket.assigned_to,
                status: ticket.status,
                epic: ticket.epic,
                dependencies: ticket.dependencies || []
            })),
            completed_tickets: projectStatus.tickets.filter(t => t.status === 'dev_complete').map(ticket => ({
                id: ticket.id,
                title: ticket.title,
                agent: ticket.assigned_to,
                completed: ticket.completed,
                epic: ticket.epic,
                files: ticket.files || [],
                description: extractTicketDescription(ticket.id, featuresContent)
            })),
            last_updated: new Date().toISOString()
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error reading project status:', error);
        res.status(500).json({ error: 'Failed to load project status' });
    }
});

// API endpoint to run sync script
app.post('/api/sync', (req, res) => {
    exec('./sync_agents.sh', { cwd: '/Users/urikogan/code' }, (error, stdout, stderr) => {
        if (error) {
            console.error('Sync error:', error);
            res.status(500).json({ error: 'Sync failed', details: error.message });
            return;
        }
        
        res.json({
            success: true,
            output: stdout,
            error_output: stderr
        });
    });
});

// API endpoint to send agent commands
app.post('/api/agent/:agent/command', async (req, res) => {
    const { agent } = req.params;
    const { command, ticket } = req.body;
    
    try {
        let pmCommand;
        
        if (command === 'start' && ticket) {
            pmCommand = `python3 pm.py start ${ticket} ${agent}`;
        } else if (command === 'continue') {
            // For continue, we'll just return current status
            pmCommand = `python3 pm.py status`;
        } else {
            throw new Error('Invalid command');
        }
        
        exec(pmCommand, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                console.error('PM command error:', error);
                res.status(500).json({ error: 'Command failed', details: error.message });
                return;
            }
            
            res.json({
                success: true,
                command: pmCommand,
                output: stdout,
                error_output: stderr
            });
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// API endpoint to get PM logs
app.get('/api/logs', async (req, res) => {
    try {
        // Read recent activity from agent_status.json and format as logs
        const statusData = await fs.readFile('./agent_status.json', 'utf8');
        const projectStatus = JSON.parse(statusData);
        
        const logs = [];
        
        // Add completed tickets as log entries
        projectStatus.tickets.forEach(ticket => {
            if (ticket.completed) {
                logs.push({
                    timestamp: ticket.completed,
                    event: 'ticket_completed',
                    message: `${ticket.assigned_to} completed ${ticket.id}: ${ticket.title}`
                });
            }
            if (ticket.started) {
                logs.push({
                    timestamp: ticket.started,
                    event: 'ticket_started', 
                    message: `${ticket.assigned_to} started ${ticket.id}: ${ticket.title}`
                });
            }
        });
        
        // Add epic creation events
        projectStatus.epics.forEach(epic => {
            if (epic.created) {
                logs.push({
                    timestamp: epic.created,
                    event: 'epic_created',
                    message: `Epic ${epic.id} created: ${epic.name}`
                });
            }
        });
        
        // Sort by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json({ logs: logs.slice(0, 20) }); // Return last 20 entries
    } catch (error) {
        console.error('Error reading logs:', error);
        res.status(500).json({ error: 'Failed to load logs' });
    }
});

// Helper function to extract ticket description from features.md
function extractTicketDescription(ticketId, featuresContent) {
    // Look for the ticket section in features.md
    const ticketPattern = new RegExp(`### .*${ticketId}.*\n([\\s\\S]*?)(?=\n### |$)`, 'i');
    const match = featuresContent.match(ticketPattern);
    
    if (match) {
        // Extract first paragraph or description
        const content = match[1];
        const descriptionMatch = content.match(/\*\*What it does\*\*: ([^\n]*)/);
        if (descriptionMatch) {
            return descriptionMatch[1];
        }
        
        // Fallback to first line of content
        const firstLine = content.split('\n').find(line => line.trim() && !line.startsWith('**'));
        return firstLine ? firstLine.trim() : 'No description available';
    }
    
    return 'No description available';
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎛️  Agent Management Dashboard running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/status`);
});

module.exports = app;
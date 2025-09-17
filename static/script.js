async function checkSystemStatus() {
            try {
                const response = await fetch('/api/status');
                const status = await response.json();
                
                const statusDot = document.getElementById('statusDot');
                const statusText = document.getElementById('systemStatus');
                
                if (status.system_ready) {
                    statusDot.style.background = '#27ae60';
                    statusText.textContent = 'System Ready';
                } else {
                    statusDot.style.background = '#e74c3c';
                    statusText.textContent = 'System Error';
                }
                
                document.getElementById('lastUpdate').textContent = `Last Update: ${status.timestamp}`;
            } catch (error) {
                console.error('Status check failed:', error);
                document.getElementById('statusDot').style.background = '#f39c12';
                document.getElementById('systemStatus').textContent = 'Connection Error';
            }
        }

        // Form submission handler
        document.getElementById('predictionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading
            document.getElementById('loading').style.display = 'block';
            document.getElementById('resultsContainer').style.display = 'none';
            document.getElementById('noResults').style.display = 'none';
            
            // Collect form data
            const formData = new FormData(e.target);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = parseFloat(value) || 0;
            }
            
            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                // Hide loading
                document.getElementById('loading').style.display = 'none';
                
                if (result.error) {
                    alert('Prediction Error: ' + result.error);
                    document.getElementById('noResults').style.display = 'block';
                } else {
                    displayResults(result);
                }
                
            } catch (error) {
                console.error('Prediction failed:', error);
                document.getElementById('loading').style.display = 'none';
                alert('Network error: ' + error.message);
                document.getElementById('noResults').style.display = 'block';
            }
        });

        // Display prediction results
        function displayResults(result) {
            const resultsContainer = document.getElementById('resultsContainer');
            const predictionResults = document.getElementById('predictionResults');
            const qualityIndicator = document.getElementById('qualityIndicator');
            const recommendations = document.getElementById('recommendations');
            const recommendationsList = document.getElementById('recommendationsList');
            
            // Clear previous results
            predictionResults.innerHTML = '';
            recommendationsList.innerHTML = '';
            
            // Display phase predictions
            const phases = [
                { key: 'clinker_XRD_alite_pct', name: 'Alite (C₃S)', class: 'alite', icon: '💪' },
                { key: 'clinker_belite_pct', name: 'Belite (C₂S)', class: 'belite', icon: '🛡️' },
                { key: 'clinker_aluminate_pct', name: 'Aluminate (C₃A)', class: 'aluminate', icon: '⚡' },
                { key: 'clinker_ferrite_pct', name: 'Ferrite (C₄AF)', class: 'ferrite', icon: '🎨' }
            ];
            
            phases.forEach(phase => {
                if (result.predictions[phase.key] !== undefined) {
                    const phaseCard = document.createElement('div');
                    phaseCard.className = `phase-card ${phase.class}`;
                    phaseCard.innerHTML = `
                        <div class="phase-value">${result.predictions[phase.key]}%</div>
                        <div class="phase-name">${phase.icon} ${phase.name}</div>
                    `;
                    predictionResults.appendChild(phaseCard);
                }
            });
            
            // Display quality assessment
            const qualityClass = result.quality_assessment.toLowerCase().replace('_', '-');
            qualityIndicator.className = `quality-indicator quality-${qualityClass}`;
            qualityIndicator.innerHTML = `
                <strong>Quality Assessment:</strong> ${result.quality_assessment}<br>
                <strong>Total Phases:</strong> ${result.total_phases}%
            `;
            
            // Display recommendations
            if (result.recommendations && result.recommendations.length > 0) {
                result.recommendations.forEach(rec => {
                    const li = document.createElement('li');
                    li.textContent = rec;
                    recommendationsList.appendChild(li);
                });
                recommendations.style.display = 'block';
            } else {
                recommendations.style.display = 'none';
            }
            
            // Show results
            resultsContainer.style.display = 'block';
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', () => {
            checkSystemStatus();
            // Check status every 30 seconds
            setInterval(checkSystemStatus, 30000);
        });

        // Auto-predict on significant input changes (debounced)
        let predictionTimeout;
        const inputs = document.querySelectorAll('input[type="number"]');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(predictionTimeout);
                predictionTimeout = setTimeout(() => {
                    // Auto-predict after 2 seconds of no changes
                    document.getElementById('predictionForm').dispatchEvent(new Event('submit'));
                }, 2000);
            });
        });
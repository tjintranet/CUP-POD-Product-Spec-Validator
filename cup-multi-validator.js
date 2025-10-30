// DOM Elements and Initial Setup
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const resultsArea = document.getElementById('resultsArea');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const processingSpinner = document.getElementById('processingSpinner');
const resultsSummary = document.getElementById('resultsSummary');
const totalFilesEl = document.getElementById('totalFiles');
const totalShowingEl = document.getElementById('totalShowing');
const totalPassedEl = document.getElementById('totalPassed');
const totalFailedEl = document.getElementById('totalFailed');

// Store results
let validationResults = [];
let validator;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    processingSpinner.style.display = 'none';
    validator = new CUPValidator();
    setupEventListeners();
});

// Set up all event listeners
function setupEventListeners() {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(file => 
            file.name.toLowerCase().endsWith('.xml')
        );
        if (files.length > 0) {
            handleFiles(files);
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.name.toLowerCase().endsWith('.xml')
        );
        if (files.length > 0) {
            handleFiles(files);
        }
    });

    clearBtn.addEventListener('click', () => {
        validationResults = [];
        updateResultsDisplay();
        downloadBtn.disabled = true;
        clearBtn.disabled = true;
    });

    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validationResults.length > 0) {
            downloadResults();
        }
    });
}

// Function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to read file content
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = (e) => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
}

// Function to validate XML content
function validateXMLContent(xmlContent, fileName) {
    if (!validator) {
        validator = new CUPValidator();
    }

    try {
        if (typeof xmlContent !== 'string') {
            return {
                validations: [{
                    test: 'XML Format',
                    result: false,
                    message: 'Invalid XML content type'
                }],
                isbn: '',
                title: ''
            };
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
        if (parseError) {
            return {
                validations: [{
                    test: 'XML Format',
                    result: false,
                    message: `Invalid XML format: ${parseError.textContent}`
                }],
                isbn: '',
                title: ''
            };
        }

        const recordNode = xmlDoc.getElementsByTagName('record')[0];
        if (!recordNode) {
            return {
                validations: [{
                    test: 'XML Structure',
                    result: false,
                    message: 'Missing root record element'
                }],
                isbn: '',
                title: ''
            };
        }

        // Extract ISBN and title for display
        const isbn = recordNode.querySelector('isbn')?.textContent?.trim() || '';
        const title = recordNode.querySelector('title')?.textContent?.trim() || '';

        const validations = validator.validate(recordNode);
        return {
            validations: validations,
            isbn: isbn,
            title: title
        };
    } catch (error) {
        console.error('Error processing XML:', error);
        return {
            validations: [{
                test: 'Processing Error',
                result: false,
                message: `Error: ${error.message}`
            }],
            isbn: '',
            title: ''
        };
    }
}

// Handle file uploads
async function handleFiles(files) {
    if (files.length === 0) return;

    processingSpinner.style.display = 'block';
    dropZone.style.display = 'none';

    try {
        for (const file of files) {
            try {
                const content = await readFileContent(file);
                const result = validateXMLContent(content, file.name);
                
                validationResults.push({
                    fileName: file.name,
                    isbn: result.isbn,
                    title: result.title,
                    validations: result.validations
                });
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                validationResults.push({
                    fileName: file.name,
                    isbn: '',
                    title: '',
                    validations: [{
                        test: 'File Error',
                        result: false,
                        message: `Failed to process file: ${error.message}`
                    }]
                });
            }
        }

        updateResultsDisplay();
        downloadBtn.disabled = false;
        clearBtn.disabled = false;

    } catch (error) {
        console.error('Error handling files:', error);
        alert('An error occurred while processing files. Please try again.');
    } finally {
        processingSpinner.style.display = 'none';
        fileInput.value = '';
    }
}

// Calculate summary statistics
function calculateSummary() {
    const total = validationResults.length;
    const passed = validationResults.filter(r => 
        r.validations.every(v => v.result)
    ).length;
    const failed = total - passed;

    return {
        total: total,
        showing: total,
        passed: passed,
        failed: failed
    };
}

// Update results display
function updateResultsDisplay() {
    if (validationResults.length === 0) {
        resultsArea.innerHTML = `
            <div class="col-12 text-center text-muted">
                <p>Upload XML files to see validation results</p>
            </div>
        `;
        resultsSummary.classList.add('d-none');
        dropZone.style.display = 'flex';
        return;
    }

    const summary = calculateSummary();

    totalFilesEl.textContent = summary.total;
    totalShowingEl.textContent = summary.showing;
    totalPassedEl.textContent = summary.passed;
    totalFailedEl.textContent = summary.failed;

    resultsSummary.classList.remove('d-none');

    resultsArea.innerHTML = validationResults
        .map((fileResult, index) => {
            const hasErrors = fileResult.validations.some(v => !v.result);
            const displayName = fileResult.isbn || fileResult.fileName;
            
            return `
                <div class="col-12 fade-in">
                    <div class="card ${hasErrors ? 'border-danger' : 'border-success'} compact-card">
                        <div class="card-header ${hasErrors ? 'bg-danger' : 'bg-success'} bg-opacity-10 d-flex justify-content-between align-items-center py-2">
                            <div>
                                <strong>${escapeHtml(displayName)}</strong>
                                ${fileResult.title ? `<span class="ms-2 text-muted small">${escapeHtml(fileResult.title)}</span>` : ''}
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-sm btn-outline-secondary" 
                                        onclick="copyToClipboard(validationResults[${index}])"
                                        data-isbn="${escapeHtml(fileResult.isbn)}">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                                <span class="badge bg-${hasErrors ? 'danger' : 'success'}">
                                    ${hasErrors ? 'Failed' : 'Passed'}
                                </span>
                            </div>
                        </div>
                        <div class="card-body py-2">
                            <ul class="list-unstyled mb-0 compact-list">
                                ${fileResult.validations.map(validation => `
                                    <li class="d-flex align-items-start py-1">
                                        <i class="bi ${validation.result ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2"></i>
                                        <small>
                                            <strong>${escapeHtml(validation.test)}:</strong> 
                                            ${escapeHtml(validation.message)}
                                        </small>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
}

// Generate text report content
function generateTextReport() {
    if (validationResults.length === 0) return '';
    
    const timestamp = new Date().toLocaleString();
    const summary = calculateSummary();
    
    let report = '';
    
    report += '='.repeat(80) + '\n';
    report += 'CUP XML VALIDATION ERROR REPORT\n';
    report += '='.repeat(80) + '\n';
    report += `Generated: ${timestamp}\n\n`;
    
    report += 'SUMMARY\n';
    report += '-'.repeat(40) + '\n';
    report += `Total Files Processed: ${summary.total}\n`;
    //report += `Files Passed: ${summary.passed}\n`;
    //report += `Files Failed: ${summary.failed}\n`;
    //report += `Success Rate: ${summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0}%\n\n`;
    
    report += 'VALIDATION RESULTS\n';
    report += '='.repeat(80) + '\n\n';
    
    validationResults.forEach((fileResult, index) => {
        const hasErrors = fileResult.validations.some(v => !v.result);
        const status = hasErrors ? 'FAILED' : 'PASSED';
        
        report += `${index + 1}. ISBN: ${fileResult.isbn || 'N/A'}\n`;
        if (fileResult.title) {
            report += `   Title: ${fileResult.title}\n`;
        }
        report += `   Status: ${status}\n`;
        //report += `   File: ${fileResult.fileName}\n`;
        report += '-'.repeat(80) + '\n';
        
        const totalTests = fileResult.validations.length;
        const passedTests = fileResult.validations.filter(v => v.result).length;
        const failedTests = totalTests - passedTests;
        
        report += `   Tests: ${passedTests}/${totalTests} passed`;
        if (failedTests > 0) {
            report += ` (${failedTests} failed)`;
        }
        report += '\n';
        
        const failedValidations = fileResult.validations.filter(v => !v.result);
        if (failedValidations.length > 0) {
            report += '   Failed Tests:\n';
            failedValidations.forEach(validation => {
                report += `   ✗ ${validation.test}: ${validation.message}\n`;
            });
        }
        
        report += '\n';
    });
    
    report += '='.repeat(80) + '\n';
    report += 'End of Report\n';
    report += '='.repeat(80) + '\n';
    
    return report;
}

// Download results as text report
function downloadResults() {
    if (validationResults.length === 0) return;
    
    const reportContent = generateTextReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `cup_validation_summary_${timestamp}.txt`;
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Copy results to clipboard
async function copyToClipboard(fileResult) {
    const isbn = fileResult.isbn || fileResult.fileName;
    const hasErrors = fileResult.validations.some(v => !v.result);
    
    let text = `Validation Results for ISBN: ${isbn}\n`;
    if (fileResult.title) {
        text += `Title: ${fileResult.title}\n`;
    }
    text += `Status: ${hasErrors ? 'Failed' : 'Passed'}\n`;
    text += '----------------------------------------\n';
    
    fileResult.validations.forEach(validation => {
        text += `${validation.result ? '✓' : '✗'} ${validation.test}: ${validation.message}\n`;
    });
    
    text += '----------------------------------------\n';
    
    try {
        await navigator.clipboard.writeText(text);
        
        const button = document.querySelector(`[data-isbn="${isbn}"]`);
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check-circle"></i> Copied!';
        button.classList.remove('btn-outline-light');
        button.classList.add('btn-success');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-light');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please try again.');
    }
}

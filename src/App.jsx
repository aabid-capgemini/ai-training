import React, { useState } from 'react';
import { trainingContent } from './data/content';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [selectedModule, setSelectedModule] = useState(null);
  const [completedModules, setCompletedModules] = useState(new Set());

  const handleModuleClick = (moduleId) => {
    const module = trainingContent.find(m => m.id === moduleId);
    setSelectedModule(module);
    setCurrentView('module');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedModule(null);
  };

  const markModuleComplete = (moduleId) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  };

  const formatContent = (content) => {
    // Split content into lines for processing
    const lines = content.split('\n');
    const processedLines = [];
    let inCodeBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          processedLines.push(`<div class="bg-gray-100 p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto border">`);
          inCodeBlock = true;
        } else {
          processedLines.push(`</div>`);
          inCodeBlock = false;
        }
        continue;
      }
      
      // If we're in a code block, don't process formatting
      if (inCodeBlock) {
        processedLines.push(`<div class="text-gray-800">${line}</div>`);
        continue;
      }
      
      // Handle headers
      if (line.startsWith('# ')) {
        processedLines.push(`<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-900">${line.substring(2)}</h1>`);
        continue;
      }
      if (line.startsWith('## ')) {
        processedLines.push(`<h2 class="text-2xl font-semibold mt-6 mb-3 text-gray-800">${line.substring(3)}</h2>`);
        continue;
      }
      if (line.startsWith('### ')) {
        processedLines.push(`<h3 class="text-xl font-semibold mt-4 mb-2 text-gray-800">${line.substring(4)}</h3>`);
        continue;
      }
      if (line.startsWith('#### ')) {
        processedLines.push(`<h4 class="text-lg font-semibold mt-3 mb-2 text-gray-700">${line.substring(5)}</h4>`);
        continue;
      }
      
      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        // Process formatting in bullet text
        const formattedBullet = processInlineFormatting(bulletText);
        processedLines.push(`<li class="ml-4 mb-1 text-gray-700 list-disc">${formattedBullet}</li>`);
        continue;
      }
      
      // Handle numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const listText = line.trim().replace(/^\d+\.\s/, '');
        const formattedList = processInlineFormatting(listText);
        processedLines.push(`<li class="ml-4 mb-1 text-gray-700 list-decimal">${formattedList}</li>`);
        continue;
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        processedLines.push(`<br />`);
        continue;
      }
      
      // Process regular paragraphs with inline formatting
      const formattedLine = processInlineFormatting(line);
      processedLines.push(`<p class="mb-3 text-gray-700 leading-relaxed">${formattedLine}</p>`);
    }
    
    return processedLines.join('');
  };
  
  const processInlineFormatting = (text) => {
    // Handle mathematical expressions (bold formatting for math)
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-blue-700">$1</strong>');
    
    // Handle italic text
    text = text.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono border">$1</code>');
    
    // Handle mathematical symbols and expressions
    text = text.replace(/Attention\(([^)]+)\)/g, '<span class="font-mono text-blue-600">Attention($1)</span>');
    text = text.replace(/softmax\(([^)]+)\)/g, '<span class="font-mono text-blue-600">softmax($1)</span>');
    
    return text;
  };

  const renderOverview = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">🧠 AI Training</div>
              <div className="ml-3 text-sm text-gray-600">Business Consultant's Guide</div>
            </div>
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => setCurrentView('overview')}
            >
              Overview
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🧠 AI Training</h1>
            <p className="text-xl mb-2">Business Consultant's Guide to AI/ML</p>
            <p className="text-lg opacity-90 mb-8">
              Master AI and Machine Learning concepts with practical business applications and real-world insights.
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="bg-white/20 px-4 py-2 rounded-lg">8 Comprehensive Modules</div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">Interactive Learning</div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">Business-Focused</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="text-xl font-semibold">🎯 Your Learning Progress</div>
          </div>
          <p className="text-gray-600 mb-4">Track your progress through the AI training modules</p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Modules Completed</span>
              <span>{completedModules.size} of {trainingContent.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedModules.size / trainingContent.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {trainingContent.map((module) => (
              <div
                key={module.id}
                className={`text-center p-2 rounded-lg text-xs cursor-pointer hover:opacity-80 ${
                  completedModules.has(module.id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => handleModuleClick(module.id)}
              >
                Module {module.id}
              </div>
            ))}
          </div>
        </div>

        {/* Training Modules */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Training Modules</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {trainingContent.map((module) => (
              <div
                key={module.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleModuleClick(module.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{module.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-600">{module.subtitle}</p>
                      </div>
                    </div>
                    {completedModules.has(module.id) && (
                      <div className="text-green-600 text-xl">✓</div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4">{module.description}</p>
                  
                  <div className="mb-4">
                    {module.topics.slice(0, 3).map((topic, index) => (
                      <div key={index} className="text-sm text-gray-600 mb-1">
                        • {topic}
                      </div>
                    ))}
                    {module.topics.length > 3 && (
                      <div className="text-sm text-blue-600">
                        +{module.topics.length - 3} more topics
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Start Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderModule = () => {
    if (!selectedModule) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={handleBackToOverview}
                  className="text-blue-600 hover:text-blue-800 mr-4 flex items-center"
                >
                  ← Back to Overview
                </button>
                <div className="text-2xl font-bold text-blue-600">
                  {selectedModule.icon} {selectedModule.title}
                </div>
              </div>
              <button
                onClick={() => markModuleComplete(selectedModule.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  completedModules.has(selectedModule.id)
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {completedModules.has(selectedModule.id) ? '✓ Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedModule.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{selectedModule.subtitle}</p>
              <p className="text-gray-700">{selectedModule.description}</p>
            </div>

            {/* Topics Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Topics Covered</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {selectedModule.topics.map((topic, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-blue-600 mr-3">✓</div>
                    <div className="text-gray-700">{topic}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <div 
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(selectedModule.content)
                }}
              />
            </div>

            {/* Navigation */}
            <div className="mt-8 pt-6 border-t flex justify-between">
              <button
                onClick={handleBackToOverview}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Overview
              </button>
              <button
                onClick={() => markModuleComplete(selectedModule.id)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {completedModules.has(selectedModule.id) ? 'Completed ✓' : 'Complete Module'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {currentView === 'overview' ? renderOverview() : renderModule()}
    </div>
  );
}

export default App;


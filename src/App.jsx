import React, { useState } from 'react';
import { trainingContent } from './data/content';
import katex from 'katex';
import './App.css';
import ScrollToTop from './components/ScrollToTop';
import TableOfContents from './components/TableOfContents';

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

  const renderMath = (mathExpression, displayMode = false) => {
    try {
      // Don't process if it already looks correct - just render it directly
      if (mathExpression.includes('\\mathrm{') || mathExpression.includes('\\frac{') || mathExpression.includes('\\left(')) {
        // Already properly formatted, render as-is
        return katex.renderToString(mathExpression, {
          displayMode: displayMode,
          throwOnError: false,
          errorColor: '#cc0000',
          strict: 'warn',
          trust: true,
          macros: {
            '\\RR': '\\mathbb{R}',
            '\\leq': '\\leq',
            '\\infty': '\\infty'
          }
        });
      }
      
      // Process the math expression - most should already have proper LaTeX
      let processedMath = mathExpression;
      
      // Fix common LaTeX issues where backslashes might be missing
      if (!mathExpression.includes('\\')) {
        processedMath = mathExpression
          .replace(/\bmathbb\{R\}/g, '\\mathbb{R}')
          .replace(/\bDelta\b/g, '\\Delta')
          .replace(/\btimes\b/g, '\\times')  
          .replace(/\bll\b/g, '\\ll')
          .replace(/\bapprox\b/g, '\\approx')
          .replace(/\sin\s/g, ' \\in ')
          .replace(/\bmin\b/g, '\\min')
          .replace(/\bmax\b/g, '\\max')
          .replace(/\bsum\b/g, '\\sum')
          .replace(/\bexp\b/g, '\\exp')
          .replace(/\blog\b/g, '\\log')
          .replace(/\bsoftmax\b/g, '\\mathrm{softmax}')
          .replace(/\bfrac\{([^}]+)\}\{([^}]+)\}/g, '\\frac{$1}{$2}')
          .replace(/\bsqrt\{([^}]+)\}/g, '\\sqrt{$1}');
      }
      
      return katex.renderToString(processedMath, {
        displayMode: displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
        trust: true, // Allow \text and other commands
        macros: {
          '\\RR': '\\mathbb{R}',
          '\\leq': '\\leq',
          '\\infty': '\\infty'
        }
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return `<span style="color: red;">[Math Error: ${mathExpression}]</span>`;
    }
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
          processedLines.push(`<div class="bg-gradient-to-br from-[#F8FAFB] to-[#F0F8FC] p-6 rounded-lg my-6 font-mono text-sm overflow-x-auto border-2 border-[#E8F4F9] shadow-md">`);
          inCodeBlock = true;
        } else {
          processedLines.push(`</div>`);
          inCodeBlock = false;
        }
        continue;
      }
      
      // If we're in a code block, don't process formatting
      if (inCodeBlock) {
        processedLines.push(`<div class="text-gray-800 leading-relaxed">${line}</div>`);
        continue;
      }
      
      // Handle headers with IDs for table of contents
      if (line.startsWith('# ')) {
        const headingText = line.substring(2);
        processedLines.push(`<h1 id="heading-${i}" class="text-4xl font-bold mt-10 mb-6 bg-gradient-to-r from-[#0070AD] to-[#12239E] bg-clip-text text-transparent border-b-4 border-[#0070AD] pb-3">${headingText}</h1>`);
        continue;
      }
      if (line.startsWith('## ')) {
        const headingText = line.substring(3);
        processedLines.push(`<h2 id="heading-${i}" class="text-3xl font-bold mt-8 mb-5 text-[#0070AD] border-l-4 border-[#0070AD] pl-4">${headingText}</h2>`);
        continue;
      }
      if (line.startsWith('### ')) {
        const headingText = line.substring(4);
        processedLines.push(`<h3 id="heading-${i}" class="text-2xl font-semibold mt-6 mb-4 text-[#00A1DE]">${headingText}</h3>`);
        continue;
      }
      if (line.startsWith('#### ')) {
        const headingText = line.substring(5);
        processedLines.push(`<h4 id="heading-${i}" class="text-xl font-semibold mt-5 mb-3 text-gray-800">${headingText}</h4>`);
        continue;
      }
      
      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        // Process formatting in bullet text
        const formattedBullet = processInlineFormatting(bulletText);
        processedLines.push(`<li class="ml-6 mb-2 text-gray-800 list-disc marker:text-[#0070AD]">${formattedBullet}</li>`);
        continue;
      }
      
      // Handle numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const listText = line.trim().replace(/^\d+\.\s/, '');
        const formattedList = processInlineFormatting(listText);
        processedLines.push(`<li class="ml-6 mb-2 text-gray-800 list-decimal marker:text-[#0070AD] marker:font-bold">${formattedList}</li>`);
        continue;
      }
      
      // Handle display math expressions that are on their own line
      if (line.trim().startsWith('$') && line.trim().endsWith('$') && line.trim().length > 2 && !line.includes('$$')) {
        const mathExpression = line.trim().slice(1, -1);
        const rendered = renderMath(mathExpression, true);
        processedLines.push(`<div class="math-display my-6 text-center">${rendered}</div>`);
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
    // Handle LaTeX math expressions first (before other formatting)
    // Handle display math expressions ($$...$$)
    text = text.replace(/\$\$([^$]+)\$\$/g, (match, mathExpression) => {
      return `<div class="math-display my-4 text-center">${renderMath(mathExpression.trim(), true)}</div>`;
    });
    
    // Handle inline math expressions ($...$)
    text = text.replace(/\$([^$]+)\$/g, (match, mathExpression) => {
      return `<span class="math-inline">${renderMath(mathExpression.trim(), false)}</span>`;
    });
    
    // Handle mathematical expressions (bold formatting for math)
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-[#0070AD]">$1</strong>');
    
    // Handle italic text
    text = text.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-700">$1</em>');
    
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-[#F0F8FC] px-3 py-1 rounded-md text-sm font-mono border border-[#E8F4F9] text-[#0070AD]">$1</code>');
    
    return text;
  };

  const renderOverview = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-[#0070AD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-[#0070AD] to-[#12239E] bg-clip-text text-transparent">
                🧠 AI Training Platform
              </div>
              <div className="ml-3 text-sm text-gray-600 font-medium">
                Capgemini Business Consultant's Guide
              </div>
            </div>
            <button 
              className="bg-[#0070AD] text-white px-6 py-3 rounded-lg hover:bg-[#005A8C] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              onClick={() => setCurrentView('overview')}
            >
              📚 Overview
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="capgemini-gradient text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">🧠 AI Training Excellence</h1>
            <p className="text-2xl mb-3 font-light">Business Consultant's Comprehensive Guide to AI/ML</p>
            <p className="text-lg opacity-95 mb-10 max-w-3xl mx-auto">
              Master cutting-edge AI and Machine Learning concepts with practical business applications, 
              real-world insights, and hands-on implementation strategies designed for Capgemini consultants.
            </p>
            <div className="flex justify-center flex-wrap gap-4 text-sm">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300">
                ✅ 8 Comprehensive Modules
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300">
                🎯 Interactive Learning
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300">
                💼 Business-Focused
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300">
                🚀 Industry-Ready Skills
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border-t-4 border-[#0070AD]">
          <div className="flex items-center mb-6">
            <div className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-3">🎯</span> Your Learning Journey
            </div>
          </div>
          <p className="text-gray-700 mb-6 text-lg">Track your progress and continue building your AI expertise</p>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-700 mb-3 font-semibold">
              <span>Modules Completed</span>
              <span className="text-[#0070AD]">{completedModules.size} of {trainingContent.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-[#0070AD] to-[#00A1DE] h-4 rounded-full transition-all duration-500 shadow-md relative overflow-hidden"
                style={{ width: `${(completedModules.size / trainingContent.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="mt-2 text-right text-xs text-gray-500">
              {Math.round((completedModules.size / trainingContent.length) * 100)}% Complete
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {trainingContent.map((module) => (
              <div
                key={module.id}
                className={`text-center p-3 rounded-lg text-sm cursor-pointer transition-all duration-300 font-semibold hover:scale-105 ${
                  completedModules.has(module.id)
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-[#E8F4F9] hover:to-[#D0E9F5] hover:text-[#0070AD]'
                }`}
                onClick={() => handleModuleClick(module.id)}
              >
                {completedModules.has(module.id) ? '✓' : module.id}
              </div>
            ))}
          </div>
        </div>

        {/* Training Modules */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            <span className="bg-gradient-to-r from-[#0070AD] to-[#12239E] bg-clip-text text-transparent">
              Training Modules
            </span>
          </h2>
          <p className="text-center text-gray-600 mb-10 text-lg">
            Select a module to begin your learning journey
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {trainingContent.map((module) => (
              <div
                key={module.id}
                className="bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-[#0070AD] transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => handleModuleClick(module.id)}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        {module.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0070AD] transition-colors duration-300">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">{module.subtitle}</p>
                      </div>
                    </div>
                    {completedModules.has(module.id) && (
                      <div className="text-green-600 text-2xl bg-green-100 rounded-full w-10 h-10 flex items-center justify-center">✓</div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">{module.description}</p>
                  
                  <div className="mb-6 space-y-2">
                    {module.topics.slice(0, 3).map((topic, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-[#0070AD] mr-2 mt-0.5">▶</span>
                        <span>{topic}</span>
                      </div>
                    ))}
                    {module.topics.length > 3 && (
                      <div className="text-sm text-[#0070AD] font-semibold pl-5">
                        +{module.topics.length - 3} more topics
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-[#0070AD] to-[#00A1DE] text-white py-3 px-6 rounded-lg hover:shadow-xl transition-all duration-300 font-semibold group-hover:scale-105">
                    Start Learning →
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
        {/* Table of Contents Sidebar */}
        <TableOfContents content={selectedModule.content} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white shadow-md border-b-2 border-[#0070AD] sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <button
                    onClick={handleBackToOverview}
                    className="text-[#0070AD] hover:text-[#005A8C] mr-6 flex items-center font-semibold transition-colors duration-300 hover:scale-105"
                  >
                    <span className="text-xl mr-2">←</span> Back to Overview
                  </button>
                  <div className="text-2xl font-bold bg-gradient-to-r from-[#0070AD] to-[#12239E] bg-clip-text text-transparent flex items-center">
                    <span className="mr-3">{selectedModule.icon}</span>
                    {selectedModule.title}
                  </div>
                </div>
                <button
                  onClick={() => markModuleComplete(selectedModule.id)}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg ${
                    completedModules.has(selectedModule.id)
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-[#0070AD] to-[#00A1DE] text-white hover:scale-105'
                  }`}
                >
                  {completedModules.has(selectedModule.id) ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          </header>

          {/* Module Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="bg-white rounded-xl shadow-xl p-10 border-t-4 border-[#0070AD]">
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <span className="text-5xl mr-4">{selectedModule.icon}</span>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0070AD] to-[#12239E] bg-clip-text text-transparent mb-2">
                        {selectedModule.title}
                      </h1>
                      <p className="text-xl text-gray-700 mb-4 font-medium">{selectedModule.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg border-l-4 border-[#0070AD] pl-6 py-2 bg-[#F0F8FC]">
                    {selectedModule.description}
                  </p>
                </div>

                {/* Topics Overview */}
                <div className="mb-10 bg-gradient-to-br from-[#F0F8FC] to-white rounded-lg p-6 border border-[#E8F4F9]">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="text-[#0070AD] mr-3">📋</span> Topics Covered
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedModule.topics.map((topic, index) => (
                      <div key={index} className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                        <div className="text-[#0070AD] mr-3 mt-0.5 font-bold">✓</div>
                        <div className="text-gray-800 font-medium">{topic}</div>
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
                <div className="mt-10 pt-8 border-t-2 border-gray-200 flex justify-between">
                  <button
                    onClick={handleBackToOverview}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    ← Back to Overview
                  </button>
                  <button
                    onClick={() => markModuleComplete(selectedModule.id)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    {completedModules.has(selectedModule.id) ? 'Completed ✓' : 'Complete Module ✓'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {currentView === 'overview' ? renderOverview() : renderModule()}
      <ScrollToTop />
    </div>
  );
}

export default App;


/**
 * Test script for AI Assistant integration
 * 
 * This script tests the AI service functionality by directly calling the AI service methods.
 * Run this script to verify that OpenAI integration is working correctly.
 */

require('dotenv').config();
const aiService = require('../services/ai.service');

// Sample question for testing
const sampleQuestion = {
  _id: '1',
  text: 'What is the quadratic formula?',
  options: [
    'x = (-b ± √(b² - 4ac)) / 2a',
    'x = -b / 2a',
    'x = -b / a',
    'x = (-b ± √(b² + 4ac)) / 2a'
  ],
  correctAnswer: 'x = (-b ± √(b² - 4ac)) / 2a',
  subject: 'Math',
  difficulty: 'Medium',
  hints: ['Think about solving ax² + bx + c = 0', 'It involves a square root'],
  explanations: {
    text: 'The quadratic formula x = (-b ± √(b² - 4ac)) / 2a is used to solve quadratic equations of the form ax² + bx + c = 0.',
    visual: 'The quadratic formula can be visualized as finding the x-intercepts of a parabola on a graph.',
    auditory: 'The quadratic formula sounds like: "Negative b plus or minus the square root of b squared minus four a c, all divided by two a."',
    kinesthetic: 'Imagine the quadratic formula as a balance scale. On the left side is -b, and on the right is either +√(b² - 4ac) or -√(b² - 4ac).'
  }
};

// Sample user for testing
const sampleUser = {
  _id: '1',
  name: 'Test User',
  learningStyle: 'visual',
  targetScore: 1500
};

// Test AI integration
const testAiIntegration = async () => {
  console.log('=== AI ASSISTANT INTEGRATION TEST ===');
  console.log('');
  
  // Check if OpenAI API key is configured
  const openaiApiKey = process.env.OPENAI_API_KEY;
  console.log(`OpenAI API Key configured: ${openaiApiKey ? 'YES' : 'NO'}`);
  console.log('');
  
  try {
    // Test hint generation
    console.log('=== HINT GENERATION TEST ===');
    const hint = await aiService.generateHint(sampleQuestion, 0);
    console.log('Generated hint:');
    console.log(hint);
    console.log('');
    
    // Test explanation generation for different learning styles
    console.log('=== EXPLANATION GENERATION TEST ===');
    const learningStyles = ['visual', 'auditory', 'kinesthetic', 'text'];
    
    for (const style of learningStyles) {
      const user = { ...sampleUser, learningStyle: style };
      console.log(`Generating explanation for ${style} learner...`);
      const explanation = await aiService.generateExplanation(sampleQuestion, user);
      console.log(`${style.toUpperCase()} EXPLANATION:`);
      console.log(explanation);
      console.log('');
    }
    
    // Test recommendation generation
    console.log('=== RECOMMENDATIONS GENERATION TEST ===');
    console.log('Generating general recommendations...');
    const generalRecommendations = await aiService.generateRecommendations(sampleUser);
    console.log('GENERAL RECOMMENDATIONS:');
    generalRecommendations.forEach((rec, i) => console.log(`${i+1}. ${rec}`));
    console.log('');
    
    console.log('Generating subject-specific recommendations...');
    const subjectRecommendations = await aiService.generateRecommendations(sampleUser, 'Math');
    console.log('MATH RECOMMENDATIONS:');
    subjectRecommendations.forEach((rec, i) => console.log(`${i+1}. ${rec}`));
    
    console.log('');
    console.log('=== TEST COMPLETE ===');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
};

// Run the test
testAiIntegration(); 
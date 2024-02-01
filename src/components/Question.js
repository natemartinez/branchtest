import React, { useState } from 'react';

const Question = ({data, answerSelect, nextQuestion}) => {
  
  const {question, options} = data;
  const [chosenOption, setChosenOption] = useState(null);
  const [answerSelected, setAnswerSelected] = useState(false);
    

  const optionSelected = (optionName) => {
    // Only the chosen options will have their class changed
    setChosenOption(optionName);
    setAnswerSelected(true);

    // Saves the option that was selected for an array
    answerSelect(optionName)
    
  }

  const moveNextQuestion = () => {
    setAnswerSelected(false);
    setChosenOption(null);
    nextQuestion(); 
  }

  return (
    <div className='quiz-div'>
      <h3>{question}</h3>
      <ul className='option-list'>
        {options.map((option, index) => (
          <li key={index}>

            <button className={chosenOption === option ? 'option-btn-clicked' : 'option-btn'} onClick={() => optionSelected(option)}>
              {option}
            </button>
          </li>
        ))}
      </ul>
      {answerSelected && (
        <button className='next-btn' onClick={moveNextQuestion}>Next</button>
      )}
    </div>
  );
};

export default Question;
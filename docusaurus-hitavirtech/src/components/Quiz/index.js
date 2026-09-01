import React, {useState} from 'react';

/**
 * Interactive knowledge-check quiz.
 * props.questions: [{question, options: [..], answer: index, explanation}]
 */
export default function Quiz({title = 'Knowledge check', questions}) {
  const [selected, setSelected] = useState(() => questions.map(() => null));
  const [checked, setChecked] = useState(false);

  const pick = (qi, oi) => {
    if (checked) return;
    setSelected((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  };

  const score = questions.reduce(
    (acc, q, i) => acc + (selected[i] === q.answer ? 1 : 0),
    0,
  );
  const allAnswered = selected.every((v) => v !== null);

  return (
    <div className="hv-quiz">
      <div className="hv-quiz-title">🧠 {title}</div>
      {questions.map((q, qi) => (
        <div key={qi}>
          <div className="hv-quiz-q">
            {qi + 1}. {q.question}
          </div>
          {q.options.map((opt, oi) => {
            let cls = 'hv-quiz-option';
            if (checked) {
              if (oi === q.answer) cls += ' correct';
              else if (selected[qi] === oi) cls += ' incorrect';
            }
            return (
              <label key={oi} className={cls}>
                <input
                  type="radio"
                  name={`q-${title}-${qi}`}
                  checked={selected[qi] === oi}
                  onChange={() => pick(qi, oi)}
                  disabled={checked}
                />
                {String.fromCharCode(97 + oi)}) {opt}
              </label>
            );
          })}
          {checked && (
            <p className="hv-quiz-explain">
              {selected[qi] === q.answer ? '✅' : '❌'} {q.explanation}
            </p>
          )}
        </div>
      ))}
      <div className="hv-quiz-check">
        <button
          className="button button--primary button--sm"
          disabled={!allAnswered || checked}
          onClick={() => setChecked(true)}>
          Check answers
        </button>
        {!allAnswered && !checked && (
          <span className="hv-quiz-score" style={{fontWeight: 400, fontSize: '0.85rem'}}>
            Answer every question to check.
          </span>
        )}
        {checked && (
          <span className="hv-quiz-score">
            Score: {score}/{questions.length}
          </span>
        )}
      </div>
    </div>
  );
}

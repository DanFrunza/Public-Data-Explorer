function isValidSuggestion(text) {
  return typeof text === 'string' && text.trim().length >= 5 && text.trim().length <= 1000;
}

function validateSuggestion(payload) {
  const { text } = payload || {};
  const errors = {};
  if (!isValidSuggestion(text)) errors.text = 'Suggestion must be 5-1000 characters.';
  return errors;
}

module.exports = { isValidSuggestion, validateSuggestion };
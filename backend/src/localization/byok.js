import { createLocalizer } from './client.js';
import { validateInput } from './input.js';
import { resolveModelConfig } from './providers.js';

export function createByokLocalizer(options) {
  return async rawInput => {
    const input = validateInput(rawInput);
    const modelConfig = resolveModelConfig(rawInput.modelConfig);
    // Credentials belong to this request only; never mutate shared configuration.
    return createLocalizer(modelConfig, options)(input);
  };
}

import { CharacterLimitOptions, characterLimitDefaultOptions } from '@escape.tech/graphql-armor-character-limit';
import type { GraphQLRequestContext } from 'apollo-server-types';
import { GraphQLError } from 'graphql';

import { ApolloProtection, ApolloServerConfigurationEnhancement } from './base-protection';

const plugin = ({ maxLength }: CharacterLimitOptions) => {
  return {
    async requestDidStart(context: GraphQLRequestContext) {
      if (!context.request.query) return;
      if (context.request.query.length > maxLength!) {
        throw new GraphQLError('Query is too large.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    },
  };
};

export class ApolloCharacterLimitProtection extends ApolloProtection {
  get isEnabled(): boolean {
    if (!this.config.characterLimit) {
      return this.enabledByDefault;
    }
    return this.config.characterLimit.enabled ?? this.enabledByDefault;
  }

  protect(): ApolloServerConfigurationEnhancement {
    return {
      plugins: [
        plugin({
          maxLength: this.config.characterLimit?.maxLength ?? characterLimitDefaultOptions.maxLength,
        }),
      ],
    };
  }
}

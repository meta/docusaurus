/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {translate} from '@docusaurus/Translate';

import type {DocSearchTranslations} from '@docsearch/react';

// TODO Docusaurus v4: require DocSearch v4
//  This needs to be cleaned after the upgrade
//  Docusaurus v3 was made compatible with both DocSearch v3 and v4
//  This implies that labels have been kept retro-compatible with v3
//  Once we upgrade, we should be able to rely on v4 types only
//  and remove v3 retro-compatibility labels that do not exist anymore in v4
const translations: DocSearchTranslations & {
  placeholder: string;
  modal: {
    searchBox: {
      placeholderText: string;
      placeholderTextAskAi: string;
      placeholderTextAskAiStreaming: string;
      enterKeyHintAskAi: string;
      searchInputLabel: string;
      backToKeywordSearchButtonText: string;
      backToKeywordSearchButtonAriaLabel: string;
      enterKeyHint: string;
      clearButtonTitle: string;
      clearButtonAriaLabel: string;
      closeButtonText: string;
      resetButtonTitle: string;
      resetButtonAriaLabel: string;
      cancelButtonText: string;
      cancelButtonAriaLabel: string;
      closeButtonAriaLabel: string;
    };
    startScreen: {
      recentConversationsTitle: string;
      removeRecentConversationButtonTitle: string;
    };
    resultsScreen: {
      askAiPlaceholder: string;
    };
    askAiScreen: {
      disclaimerText: string;
      relatedSourcesText: string;
      thinkingText: string;
      copyButtonText: string;
      copyButtonCopiedText: string;
      copyButtonTitle: string;
      likeButtonTitle: string;
      dislikeButtonTitle: string;
      thanksForFeedbackText: string;
      preToolCallText: string;
      duringToolCallText: string;
      afterToolCallText: string;
    };
    footer: {
      submitQuestionText: string;
      poweredByText: string;
      backToSearchText: string;
      searchByText: string;
    };
  };
} = {
  button: {
    buttonText: translate({
      id: 'theme.SearchBar.label',
      message: 'Search',
      description: 'The ARIA label and placeholder for search button',
    }),
    buttonAriaLabel: translate({
      id: 'theme.SearchBar.label',
      message: 'Search',
      description: 'The ARIA label and placeholder for search button',
    }),
  },
  modal: {
    searchBox: {
      resetButtonTitle: translate({
        id: 'theme.SearchModal.searchBox.resetButtonTitle',
        message: 'Clear the query',
        description: 'The label and ARIA label for search box reset button',
      }),
      resetButtonAriaLabel: translate({
        id: 'theme.SearchModal.searchBox.resetButtonTitle',
        message: 'Clear the query',
        description: 'The label and ARIA label for search box reset button',
      }),
      cancelButtonText: translate({
        id: 'theme.SearchModal.searchBox.cancelButtonText',
        message: 'Cancel',
        description: 'The label and ARIA label for search box cancel button',
      }),
      cancelButtonAriaLabel: translate({
        id: 'theme.SearchModal.searchBox.cancelButtonText',
        message: 'Cancel',
        description: 'The label and ARIA label for search box cancel button',
      }),

      // v4
      clearButtonTitle: translate({
        id: 'theme.SearchModal.searchBox.resetButtonTitle',
        message: 'Clear the query',
        description: 'The label and ARIA label for search box reset button',
      }),
      clearButtonAriaLabel: translate({
        id: 'theme.SearchModal.searchBox.resetButtonTitle',
        message: 'Clear the query',
        description: 'The label and ARIA label for search box reset button',
      }),
      closeButtonText: translate({
        id: 'theme.SearchModal.searchBox.cancelButtonText',
        message: 'Cancel',
        description: 'The label and ARIA label for search box cancel button',
      }),
      closeButtonAriaLabel: translate({
        id: 'theme.SearchModal.searchBox.cancelButtonText',
        message: 'Cancel',
        description: 'The label and ARIA label for search box cancel button',
      }),
      placeholderText: translate({
        id: 'theme.SearchModal.searchBox.placeholderText',
        message: 'Search docs',
        description: 'The placeholder text for the main search input field',
      }),
      placeholderTextAskAi: translate({
        id: 'theme.SearchModal.searchBox.placeholderTextAskAi',
        message: 'Ask another question...',
        description: 'The placeholder text when in AI question mode',
      }),
      placeholderTextAskAiStreaming: translate({
        id: 'theme.SearchModal.searchBox.placeholderTextAskAiStreaming',
        message: 'Answering...',
        description:
          'The placeholder text for search box when AI is streaming an answer',
      }),
      enterKeyHint: translate({
        id: 'theme.SearchModal.searchBox.enterKeyHint',
        message: 'search',
        description: 'The hint for the search box enter key text',
      }),
      enterKeyHintAskAi: translate({
        id: 'theme.SearchModal.searchBox.enterKeyHintAskAi',
        message: 'enter',
        description: 'The hint for the Ask AI search box enter key text',
      }),
      searchInputLabel: translate({
        id: 'theme.SearchModal.searchBox.searchInputLabel',
        message: 'Search',
        description: 'The ARIA label for search input',
      }),
      backToKeywordSearchButtonText: translate({
        id: 'theme.SearchModal.searchBox.backToKeywordSearchButtonText',
        message: 'Back to keyword search',
        description: 'The text for back to keyword search button',
      }),
      backToKeywordSearchButtonAriaLabel: translate({
        id: 'theme.SearchModal.searchBox.backToKeywordSearchButtonAriaLabel',
        message: 'Back to keyword search',
        description: 'The ARIA label for back to keyword search button',
      }),
    },
    startScreen: {
      recentSearchesTitle: translate({
        id: 'theme.SearchModal.startScreen.recentSearchesTitle',
        message: 'Recent',
        description: 'The title for recent searches',
      }),
      noRecentSearchesText: translate({
        id: 'theme.SearchModal.startScreen.noRecentSearchesText',
        message: 'No recent searches',
        description: 'The text when there are no recent searches',
      }),
      saveRecentSearchButtonTitle: translate({
        id: 'theme.SearchModal.startScreen.saveRecentSearchButtonTitle',
        message: 'Save this search',
        description: 'The title for save recent search button',
      }),
      removeRecentSearchButtonTitle: translate({
        id: 'theme.SearchModal.startScreen.removeRecentSearchButtonTitle',
        message: 'Remove this search from history',
        description: 'The title for remove recent search button',
      }),
      favoriteSearchesTitle: translate({
        id: 'theme.SearchModal.startScreen.favoriteSearchesTitle',
        message: 'Favorite',
        description: 'The title for favorite searches',
      }),
      removeFavoriteSearchButtonTitle: translate({
        id: 'theme.SearchModal.startScreen.removeFavoriteSearchButtonTitle',
        message: 'Remove this search from favorites',
        description: 'The title for remove favorite search button',
      }),
      recentConversationsTitle: translate({
        id: 'theme.SearchModal.startScreen.recentConversationsTitle',
        message: 'Recent conversations',
        description: 'The title for recent conversations',
      }),
      removeRecentConversationButtonTitle: translate({
        id: 'theme.SearchModal.startScreen.removeRecentConversationButtonTitle',
        message: 'Remove this conversation from history',
        description: 'The title for remove recent conversation button',
      }),
    },
    errorScreen: {
      titleText: translate({
        id: 'theme.SearchModal.errorScreen.titleText',
        message: 'Unable to fetch results',
        description: 'The title for error screen',
      }),
      helpText: translate({
        id: 'theme.SearchModal.errorScreen.helpText',
        message: 'You might want to check your network connection.',
        description: 'The help text for error screen',
      }),
    },
    resultsScreen: {
      askAiPlaceholder: translate({
        id: 'theme.SearchModal.resultsScreen.askAiPlaceholder',
        message: 'Ask AI: ',
        description: 'The placeholder text for Ask AI input',
      }),
    },
    askAiScreen: {
      disclaimerText: translate({
        id: 'theme.SearchModal.askAiScreen.disclaimerText',
        message:
          'Answers are generated with AI which can make mistakes. Verify responses.',
        description: 'The disclaimer text for AI answers',
      }),
      relatedSourcesText: translate({
        id: 'theme.SearchModal.askAiScreen.relatedSourcesText',
        message: 'Related sources',
        description: 'The text for related sources',
      }),
      thinkingText: translate({
        id: 'theme.SearchModal.askAiScreen.thinkingText',
        message: 'Thinking...',
        description: 'The text when AI is thinking',
      }),
      copyButtonText: translate({
        id: 'theme.SearchModal.askAiScreen.copyButtonText',
        message: 'Copy',
        description: 'The text for copy button',
      }),
      copyButtonCopiedText: translate({
        id: 'theme.SearchModal.askAiScreen.copyButtonCopiedText',
        message: 'Copied!',
        description: 'The text for copy button when copied',
      }),
      copyButtonTitle: translate({
        id: 'theme.SearchModal.askAiScreen.copyButtonTitle',
        message: 'Copy',
        description: 'The title for copy button',
      }),
      likeButtonTitle: translate({
        id: 'theme.SearchModal.askAiScreen.likeButtonTitle',
        message: 'Like',
        description: 'The title for like button',
      }),
      dislikeButtonTitle: translate({
        id: 'theme.SearchModal.askAiScreen.dislikeButtonTitle',
        message: 'Dislike',
        description: 'The title for dislike button',
      }),
      thanksForFeedbackText: translate({
        id: 'theme.SearchModal.askAiScreen.thanksForFeedbackText',
        message: 'Thanks for your feedback!',
        description: 'The text for thanks for feedback',
      }),
      preToolCallText: translate({
        id: 'theme.SearchModal.askAiScreen.preToolCallText',
        message: 'Searching...',
        description: 'The text before tool call',
      }),
      duringToolCallText: translate({
        id: 'theme.SearchModal.askAiScreen.duringToolCallText',
        message: 'Searching for ',
        description: 'The text during tool call',
      }),
      afterToolCallText: translate({
        id: 'theme.SearchModal.askAiScreen.afterToolCallText',
        message: 'Searched for',
        description: 'The text after tool call',
      }),
    },
    footer: {
      selectText: translate({
        id: 'theme.SearchModal.footer.selectText',
        message: 'Select',
        description: 'The select text for footer',
      }),
      submitQuestionText: translate({
        id: 'theme.SearchModal.footer.submitQuestionText',
        message: 'Submit question',
        description: 'The submit question text for footer',
      }),
      selectKeyAriaLabel: translate({
        id: 'theme.SearchModal.footer.selectKeyAriaLabel',
        message: 'Enter key',
        description: 'The ARIA label for select key in footer',
      }),
      navigateText: translate({
        id: 'theme.SearchModal.footer.navigateText',
        message: 'Navigate',
        description: 'The navigate text for footer',
      }),
      navigateUpKeyAriaLabel: translate({
        id: 'theme.SearchModal.footer.navigateUpKeyAriaLabel',
        message: 'Arrow up',
        description: 'The ARIA label for navigate up key in footer',
      }),
      navigateDownKeyAriaLabel: translate({
        id: 'theme.SearchModal.footer.navigateDownKeyAriaLabel',
        message: 'Arrow down',
        description: 'The ARIA label for navigate down key in footer',
      }),
      closeText: translate({
        id: 'theme.SearchModal.footer.closeText',
        message: 'Close',
        description: 'The close text for footer',
      }),
      closeKeyAriaLabel: translate({
        id: 'theme.SearchModal.footer.closeKeyAriaLabel',
        message: 'Escape key',
        description: 'The ARIA label for close key in footer',
      }),
      poweredByText: translate({
        id: 'theme.SearchModal.footer.searchByText',
        message: 'Powered by',
        description: "The 'Powered by' text for footer",
      }),
      searchByText: translate({
        id: 'theme.SearchModal.footer.searchByText',
        message: 'Powered by',
        description: "The 'Powered by' text for footer",
      }),
      backToSearchText: translate({
        id: 'theme.SearchModal.footer.backToSearchText',
        message: 'Back to search',
        description: 'The back to search text for footer',
      }),
    },
    noResultsScreen: {
      noResultsText: translate({
        id: 'theme.SearchModal.noResultsScreen.noResultsText',
        message: 'No results found for',
        description: 'The text when there are no results',
      }),
      suggestedQueryText: translate({
        id: 'theme.SearchModal.noResultsScreen.suggestedQueryText',
        message: 'Try searching for',
        description: 'The text for suggested query',
      }),
      reportMissingResultsText: translate({
        id: 'theme.SearchModal.noResultsScreen.reportMissingResultsText',
        message: 'Believe this query should return results?',
        description: 'The text for reporting missing results',
      }),
      reportMissingResultsLinkText: translate({
        id: 'theme.SearchModal.noResultsScreen.reportMissingResultsLinkText',
        message: 'Let us know.',
        description: 'The link text for reporting missing results',
      }),
    },
  },
  placeholder: translate({
    id: 'theme.SearchModal.placeholder',
    message: 'Search docs',
    description: 'The placeholder of the input of the DocSearch pop-up modal',
  }),
};

export default translations;

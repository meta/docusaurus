/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {translate} from '@docusaurus/Translate';

import type {DocSearchAITranslations} from '@docsearch/react';

// Using the "AI" translations type as it covers both search only and AI
type RuntimeDocSearchAITranslations = DocSearchAITranslations & {
  modal?: {
    askAiScreen?: {
      // Used by DocSearch v5 but missing from its published types
      feedbackCancelButtonText?: string;
    };
  };
};

const translations: RuntimeDocSearchAITranslations = {
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
      newConversationPlaceholder: translate({
        id: 'theme.SearchModal.searchBox.newConversationPlaceholder',
        message: 'Ask a question',
        description: 'The placeholder text for a new AI conversation',
      }),
      conversationHistoryTitle: translate({
        id: 'theme.SearchModal.searchBox.conversationHistoryTitle',
        message: 'My conversation history',
        description: 'The title for AI conversation history',
      }),
      startNewConversationText: translate({
        id: 'theme.SearchModal.searchBox.startNewConversationText',
        message: 'Start a new conversation',
        description: 'The label for starting a new AI conversation',
      }),
      viewConversationHistoryText: translate({
        id: 'theme.SearchModal.searchBox.viewConversationHistoryText',
        message: 'Conversation history',
        description: 'The label for opening AI conversation history',
      }),
      threadDepthErrorPlaceholder: translate({
        id: 'theme.SearchModal.searchBox.threadDepthErrorPlaceholder',
        message: 'Conversation limit reached',
        description:
          'The search box placeholder when the AI conversation limit is reached',
      }),
    },
    facets: {
      defaultValueLabel: translate({
        id: 'theme.SearchModal.facets.defaultValueLabel',
        message: 'All',
        description: 'The default value label for a search facet',
      }),
      facetMenuTriggerAriaLabel: translate({
        id: 'theme.SearchModal.facets.facetMenuTriggerAriaLabel',
        message: 'selected',
        description: 'The ARIA label suffix for a selected search facet',
      }),
      clearAllLabel: translate({
        id: 'theme.SearchModal.facets.clearAllLabel',
        message: 'Clear all',
        description: 'The label for clearing all selected search facets',
      }),
      facetsAriaLabel: translate({
        id: 'theme.SearchModal.facets.facetsAriaLabel',
        message: 'Search filters',
        description: 'The ARIA label for available search facets',
      }),
      selectedFacetsAriaLabel: translate({
        id: 'theme.SearchModal.facets.selectedFacetsAriaLabel',
        message: 'Selected search filters',
        description: 'The ARIA label for selected search facets',
      }),
      clearFacetAriaLabel: translate({
        id: 'theme.SearchModal.facets.clearFacetAriaLabel',
        message: 'Clear filter:',
        description: 'The ARIA label prefix for clearing a search facet',
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
      askAiResultsTitle: translate({
        id: 'theme.SearchModal.resultsScreen.askAiResultsTitle',
        message: 'Ask AI Assistant',
        description: 'The title for Ask AI actions in search results',
      }),
      resultBadgeLabelText: translate({
        id: 'theme.SearchModal.resultsScreen.resultBadgeLabelText',
        message: 'Category',
        description: 'The screen reader label for a search result badge',
      }),
    },
    newConversation: {
      newConversationTitle: translate({
        id: 'theme.SearchModal.newConversation.newConversationTitle',
        message: 'How can I help you today?',
        description: 'The title for a new AI conversation',
      }),
      newConversationDescription: translate({
        id: 'theme.SearchModal.newConversation.newConversationDescription',
        message:
          'I search through your documentation to help you find setup guides, feature details and troubleshooting tips, fast.',
        description: 'The description for a new AI conversation',
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
      relatedSourcesTextPlural: translate({
        id: 'theme.SearchModal.askAiScreen.relatedSourcesTextPlural',
        message: 'Sources',
        description: 'The text for multiple related sources',
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
      feedbackPanelTitle: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackPanelTitle',
        message: 'What went wrong? (optional)',
        description: 'The title for the AI response feedback panel',
      }),
      feedbackDetailsPlaceholder: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackDetailsPlaceholder',
        message: 'Share some details...',
        description: 'The placeholder for AI response feedback details',
      }),
      feedbackSubmitButtonText: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackSubmitButtonText',
        message: 'Submit',
        description: 'The label for submitting AI response feedback',
      }),
      feedbackCancelButtonText: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackCancelButtonText',
        message: 'Cancel',
        description: 'The label for cancelling AI response feedback',
      }),
      feedbackTagIncorrect: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackTagIncorrect',
        message: 'Incorrect or incomplete',
        description: 'The AI feedback tag for an incorrect response',
      }),
      feedbackTagNotWhatIAsked: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackTagNotWhatIAsked',
        message: 'Not what I asked for',
        description: 'The AI feedback tag for an irrelevant response',
      }),
      feedbackTagSlowOrBuggy: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackTagSlowOrBuggy',
        message: 'Slow or buggy',
        description: 'The AI feedback tag for a slow or buggy response',
      }),
      feedbackTagStyleOrTone: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackTagStyleOrTone',
        message: 'Style or tone',
        description: 'The AI feedback tag for an inappropriate style or tone',
      }),
      feedbackTagSafetyOrLegal: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackTagSafetyOrLegal',
        message: 'Safety or legal concern',
        description: 'The AI feedback tag for a safety or legal concern',
      }),
      feedbackTagOther: translate({
        id: 'theme.SearchModal.askAiScreen.feedbackTagOther',
        message: 'Other',
        description: 'The AI feedback tag for another concern',
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
      savedMemoryToolResultText: translate({
        id: 'theme.SearchModal.askAiScreen.savedMemoryToolResultText',
        message: 'Saved to memory',
        description: 'The text after AI saves information to memory',
      }),
      memoryToolResultText: translate({
        id: 'theme.SearchModal.askAiScreen.memoryToolResultText',
        message: 'Used memory to enhance results',
        description: 'The text after AI uses memory to enhance results',
      }),
      stoppedStreamingText: translate({
        id: 'theme.SearchModal.askAiScreen.stoppedStreamingText',
        message: 'You stopped this response',
        description: 'The text after stopping a streaming AI response',
      }),
      errorTitleText: translate({
        id: 'theme.SearchModal.askAiScreen.errorTitleText',
        message: 'Chat error',
        description: 'The title for an AI chat error',
      }),
      threadDepthExceededMessage: translate({
        id: 'theme.SearchModal.askAiScreen.threadDepthExceededMessage',
        message: 'This conversation is now closed to keep responses accurate.',
        description: 'The message when the AI conversation limit is reached',
      }),
      startNewConversationButtonText: translate({
        id: 'theme.SearchModal.askAiScreen.startNewConversationButtonText',
        message: 'Start a new conversation',
        description:
          'The button label for starting a new AI conversation after reaching the conversation limit',
      }),
      suggestedPromptsTitleText: translate({
        id: 'theme.SearchModal.askAiScreen.suggestedPromptsTitleText',
        message: 'Suggested prompts',
        description: 'The title for suggested AI prompts',
      }),
      aggregatedToolCallText: () => ({
        before: translate({
          id: 'theme.SearchModal.askAiScreen.aggregatedToolCallText.before',
          message: 'Searched for ',
          description: 'The text before a list of AI search tool queries',
        }),
        separator: translate({
          id: 'theme.SearchModal.askAiScreen.aggregatedToolCallText.separator',
          message: ', ',
          description: 'The separator between AI search tool queries',
        }),
        lastSeparator: translate({
          id: 'theme.SearchModal.askAiScreen.aggregatedToolCallText.lastSeparator',
          message: ' and ',
          description: 'The separator before the last AI search tool query',
        }),
        after: '',
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
};

export default translations;

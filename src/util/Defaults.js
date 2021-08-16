/**
 * The paginations collector arguments.
 * @typedef BasePaginationCollectorArgs
 * @property {...*} args The arguments that are passed into the listener.
 * @property {BasePaginationEmbed} paginator The pagination instance that created the collector.
 */

/**
 * Sends and returns the message which will be paginated.
 * @typedef {Function} MessageSender
 * @param {BasePaginationEmbed} paginator The pagination isntance.
 * @returns {Promise<Message>|Message}
 */

/**
 * The pagination collector filter to determine what to collect.
 * @typedef {Function} PaginationCollectorFilter
 * @property {BasePaginationCollectorArgs} collectorArgs The arguments received by the listener, plus the paginator. See {@link BasePaginationEmbed#getCollectorArgs}
 * @returns {Promise<boolean>|boolean}
 */

/**
 * Function used to determine the index of the page to change to.
 * @typedef {Function} PageResolver
 * @property {BasePaginationCollectorArgs} collectorArgs The collector arguments for this pagination.
 */

/**
 * Options used to configure all pagination embeds.
 * @typedef {CollectorFilterOptions} BasePaginationMessageOptions
 * @property {MessageSender} messageSender The function used to send the pagination message.
 * @property {PaginationCollectorFilter} collectorFilter The filter used for this paginations collector.
 * @property {PageResolver} pageResolver
 */

exports.BasePaginationDefaults = {
	startingIndex: 0,
	idle: 6e4,
	shouldChangePage: ({ newPageIndex, previousPageIndex, paginator }) =>
		!paginator.message.deleted && newPageIndex !== previousPageIndex,
	footerResolver: (paginator) => `Page ${paginator.currentPageIndex + 1} / ${paginator.numberOfPages}`,
	messageSender: (paginator) => paginator.channel.send(paginator.currentPageMessageOptions)
};

exports.ReactionPaginationDefaults = {
	...exports.BasePaginationDefaults,
	emojiList: ['⏪', '⏩'],
	collectorFilter: ({ reaction, user, paginator }) =>
		user === paginator.user && paginator.emojiList.includes(reaction.emoji.name) && !user.bot,
	pageResolver: ({ reaction, paginator }) => {
		switch (reaction.emoji.name) {
			case paginator.emojiList[0]:
				return paginator.currentPageIndex - 1;
			case paginator.emojiList[1]:
				return paginator.currentPageIndex + 1;
			default:
				return paginator.currentPageIndex;
		}
	}
};

exports.ActionRowPaginationEmbedDefaults = {
	...exports.BasePaginationDefaults,
	customIdPrefix: 'pagination',
	collectorFilter: ({ interaction, paginator }) =>
		interaction.user === paginator.user && !interaction.user.bot
};

exports.ButtonPaginationEmbedDefaults = {
	...exports.ActionRowPaginationEmbedDefaults,
	buttons: [
		{
			label: 'Previous',
			style: 'PRIMARY'
		},
		{
			label: 'Next',
			style: 'PRIMARY'
		}
	],
	pageResolver: ({ interaction, paginator }) => {
		const val = interaction.customId.toLowerCase();
		if (val.includes('prev'))
			return paginator.currentPageIndex - 1;
		else if (val.includes('next'))
			return paginator.currentPageIndex + 1;
		return paginator.currentPageIndex;
	}
};

exports.SelectPaginationEmbedDefaults = {
	...exports.ActionRowPaginationEmbedDefaults,
	messageActionRowOptions: {
		type: 'ACTION_ROW'
	},
	pagesMap: ({ selectMenuOptions, paginator }) => {
		const pagesMap = {};
		for (let i = 0; i < paginator.numberOfPages; i++)
			pagesMap[selectMenuOptions[i].value] = i;
		return pagesMap;
	},
	pageResolver: ({ interaction, paginator }) => {
		const [selectedValue] = interaction.values;
		return paginator.pagesMap[selectedValue];
	}
};
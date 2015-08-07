/*jshint node: true */
"use strict";

var EventEmitter = require('events').EventEmitter,
    template     = require('./templates/pagination.handlebars'),
    url          = require('edcs-url');

var Pagination = function () {
    var that = this;

    /**
     * The number of pagination links to display.
     *
     * @type {number}
     */
    that.NUMBER_OF_LINKS = 5;

    /**
     * Event emitter for this pagination element.
     *
     * @type {*|n}
     */
    that.emitter = new EventEmitter();

    /**
     * The URL parameters for the links.
     *
     * @type {object}
     */
    that.requestParams = null;

    /**
     * The current page.
     *
     * @type {int|*}
     */
    that.page = null;

    /**
     * The number of pages.
     *
     * @type {int|*}
     */
    that.pageCount = null;
};

Pagination.prototype = {

    /**
     * Chainable setter for request params property.
     *
     * @param {*} requestParams
     * @returns {Pagination}
     */
    setRequestParams: function (requestParams) {
        this.requestParams = requestParams;
        return this;
    },

    /**
     * Chainable setter for page parameter.
     *
     * @param {int} page
     * @returns {Pagination}
     */
    setPage: function (page) {
        this.page = page;
        return this;
    },

    /**
     * Chainable setter for page count parameter.
     *
     * @param {int} pageCount
     * @returns {Pagination}
     */
    setPageCount: function (pageCount) {
        this.pageCount = pageCount;
        return this;
    },

    /**
     * Parses the pagination template into an node list.
     *
     * @returns {NodeList}
     */
    parsePagination: function () {
        var html = this.parsePaginationTemplate();

        var div = document.createElement('div');
            div.innerHTML = html.trim();

        return this.applyPaginationEvents(div.firstChild);
    },

    /**
     * Parses the mustache pagination template to a HTML string.
     *
     * @returns {string}
     */
    parsePaginationTemplate: function () {
        var that = this;
        var links = this.generatePaginationLinks();

        var html = template({
            pageCount: that.pageCount,
            notFirst: (that.page !== 1  && that.pageCount > 1),
            pages: links,
            notLast: (that.page !== that.pageCount && that.pageCount > 1)
        });

        return html;
    },

    /**
     * Applies onclick events to pagination links.
     *
     * @param pagination
     * @returns {NodeList}
     */
    applyPaginationEvents: function (pagination) {
        var that = this;

        if (typeof pagination === 'undefined') {
            return pagination;
        }

        var links = pagination.getElementsByTagName('a');

        [].forEach.call(links, function(link) {
            link.onclick = function (ev) {
                ev.preventDefault();
                that.emitter.emit('pagination-request', this);
            };
        });

        return pagination;
    },

    /**
     * Creates an object containing page numbers for creating pagination links.
     *
     * @returns {Array}
     */
    generatePaginationLinks: function () {
        var params = this.calculateLoopParams();
        var links  = [];
        var href;

        href = this.buildPageUrl(this.page - 1);
        links.prev = {page: this.page - 1, href: href};

        href = this.buildPageUrl(1);
        links.first = {page: 1, href: href};

        href = this.buildPageUrl(this.page + 1);
        links.next = {page: this.page + 1, href: href};

        href = this.buildPageUrl(this.pageCount);
        links.last = {page: this.pageCount, href: href};

        for (var i = params.first; i <= params.last; i++) {
            href = this.buildPageUrl(i);
            links.push({page: i, href: href, current: (i === this.page)});
        }

        return links;
    },

    /**
     * Returns the parameters used to generate the individual page links.
     *
     * @returns {{first: number, last: null}}
     */
    calculateLoopParams: function () {
        var numberOfLinks = this.pageCount > this.NUMBER_OF_LINKS ? this.NUMBER_OF_LINKS : this.pageCount;
        var halfPages = Math.floor(numberOfLinks / 2);
        var params = {first: 1, last: null};

        if (this.page > halfPages) {
            params.first = this.page - halfPages;
        }

        params.last = (numberOfLinks - 1) + params.first;

        if (params.last > this.pageCount) {
            params.first = this.pageCount - (numberOfLinks - 1);
            params.last = this.pageCount;
        }

        return params;
    },

    /**
     * Returns the url for a given page number.
     *
     * @param {int} page
     * @returns {string}
     */
    buildPageUrl: function (page) {
        var params = this.requestParams;
            params.page = page;

        var href = [
            url.current(),
            url.buildQueryString(params)
        ];

        return href.join('');
    }
};

module.exports = Pagination;

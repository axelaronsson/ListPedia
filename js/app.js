const requestData = async (searchString) => {
    try {
      const response = await fetch(searchString);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

$(document).ready(function() {
    var search = {
        continue: null,
        sort: 'relevance',
        currentSearch: '',
        searchInput: '',
        init: function() {
            this.cacheDom();
            this.bindEvents();
        },
        cacheDom: function() {
            this.$el = $('main');
            this.$button = this.$el.find('#search-btn');
            this.$fwdBtn = this.$el.find('#fwd');
            this.$backBtn = this.$el.find('#back');
            this.$select = this.$el.find('#filter');
            this.$input = this.$el.find('input');
            this.$ul = this.$el.find('ul');
            this.$btnContainer = this.$el.find('#browse');
        },
        bindEvents: function() {
            this.$button.on('click', this.performSearch.bind(this));
            this.$fwdBtn.on('click', this.browse.bind(this));
            this.$backBtn.on('click', this.browse.bind(this));
            this.$select.on('change', this.filter.bind(this));
        },
        render: function(htmlContent) {
            if(this.continue.end) {
                this.$fwdBtn.css('pointer-events', 'none');
                this.$fwdBtn.css('opacity', 0.5);
            } else {
                this.$fwdBtn.css('pointer-events', 'auto');
                this.$fwdBtn.css('opacity', 1);
            }
            if(this.continue.sroffset == 10) {
                this.$backBtn.css('pointer-events', 'none');
                this.$backBtn.css('opacity', 0.5);
            } else {
                this.$backBtn.css('pointer-events', 'auto');
                this.$backBtn.css('opacity', 1);
            }
            if(this.continue.sroffset == 10 && this.continue.end) {
                this.$btnContainer.css('display', 'none');
            }

            if(htmlContent) {
                this.$ul.html(htmlContent);
            }
        },
        createContent: function(wikiResults) {
            const content = wikiResults.query.search.map(item => `
            <li>
                <h4>${item.title}</h4>
                <p>${item.snippet}...</p>
                <a href="https://en.wikipedia.org/?curid=${item.pageid}" target="_blank">Läs mer</a>
            </li>`);
            const htmlContent = content.join('');
            this.render(htmlContent);
        },
        filter: function(e) {
            if(this.currentSearch !== '') {
                this.sort = e.target.value;
                this.performSearch(e);
            }
        },
        browse: async function(e) {
            const sroffset = this.continue ? this.continue.sroffset : '';
            const offsetVal = e.target.id === 'fwd' ? sroffset : sroffset -20;
            const wikiResult = await requestData(this.currentSearch + `&sroffset=${offsetVal}&srsort=${this.sort}`);
            this.continue = wikiResult.continue ? wikiResult.continue : {sroffset: this.continue.sroffset + 10, end: true};
            this.createContent(wikiResult);
        },
        performSearch: async function(e) {
            e.preventDefault();
            this.searchInput = this.$input.val();
            const searchTerm = e.target.id === 'search-btn' ? this.searchInput : this.currentSearch;
            const searchString = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${searchTerm}&origin=*&srsort=${this.sort}`;
            this.currentSearch = searchString;
            const wikiResult = await requestData(searchString);
            if(wikiResult.error) {
                alert('Sökningen gav inga träffar');
                return;
            }
            this.$btnContainer.css('display', 'block');
            this.continue = wikiResult.continue ? wikiResult.continue : {sroffset: 10, end: true};
            this.createContent(wikiResult);
        }
    };

    search.init();

});

'use strict';
document.addEventListener('DOMContentLoaded', function() {

	var baseUrl = 'https://cors-anywhere.herokuapp.com/https://kodilla.com/pl/bootcamp-api';
	var url = 'https://kodilla.com/pl/bootcamp-api';
	var myHeaders = {
		'X-Client-Id': 3928,
		'X-Auth-Token': '0ea2f56d8f2dfe1f0937c687e65bfc4b'
	};

	//Adding a function that polls the server about the array resource
	fetch(baseUrl + '/board', { headers: myHeaders })
		.then(function(resp) {
			return resp.json();
		})
		.then(function(resp) {
			setupColumns(resp.columns);
		});
	//creation of the Column
	function setupColumns(columns) {
	  	columns.forEach(function(column) {
			var col = new Column(column.id, column.name);
	      	board.addColumn(col);
	      	setupCards(col, column.cards);
	  	});
	}
	////creation of the Card
	function setupCards(col, cards) {
		cards.forEach(function (card) {
	    	var cardObj = new Card(card.id, card.name);
	  		col.addCard(cardObj);
		});
	}
	
	//Generating templates
	function generateTemplate(name, data, basicElement) {
		var template = document.getElementById(name).innerHTML;
		var element = document.createElement(basicElement || 'div');

		Mustache.parse(template);
		element.innerHTML = Mustache.render(template, data);

		return element;
	}
	//creation of the Column class
	function convertHex(hex){
		hex = hex.replace('#','');
		var g= parseInt(hex.substring(0,2), 16);
		var r= parseInt(hex.substring(2,4), 16);
		var b = parseInt(hex.substring(4,6), 16);

		var result = 'rgb('+r+', '+g+', '+b+')';
		return result;
	}
			
	function randomColors() {
			var colors = ['#0099CC', '#00CCFF', '#33FFFF', '#66FFFF', '#99FFFF', '#CCFFFF', '#FFFFFF', '#FF66CC', '#FF99FF', '#FFCCFF', '#009966', '#33CC99', '#66FFCC'];
  			var columns = document.querySelectorAll('.column');

  			for( var i = 0; i < columns.length; i++ ) {
				var backgroundColor = convertHex(colors[Math.floor(Math.random() * colors.length)]);

				while (i > 0 && backgroundColor == columns[i-1].style["background"]) {
					backgroundColor = convertHex(colors[Math.floor(Math.random() * colors.length)]);
				}
				columns[i].style["background"] = backgroundColor;
			}
		}

	function Column(id, name) {
		var backgroundColor = '#FFFFFF';

		var self = this;

		this.id = id;
    	this.name = name || 'No name given';
		this.element = generateTemplate('column-template', {name: this.name, id: this.id, color: backgroundColor});

		//Delete and add the column after clicking the button
		this.element.querySelector('.column').addEventListener('click', function (event) {
			if (event.target.classList.contains('btn-delete')) {
				self.removeColumn();
			}
			if (event.target.classList.contains('add-card')) {
				var cardName = prompt("Enter the name of the card");
				event.preventDefault();
				var data = new FormData();
				data.append('name', cardName);
				data.append('bootcamp_kanban_column_id', self.id);

				fetch(baseUrl + '/card', {
      				method: 'POST',
      				headers: myHeaders,
    				body: data,
    			})
    			.then(function(res) {
    			  	return res.json();
    			})
    			.then(function(resp) {
    				var card = new Card(resp.id, cardName);
    				self.addCard(card);
				});
			}
			if (event.target.classList.contains('btn-rename')) {
				var columnName = prompt("Enter a new name");

				fetch(baseUrl + '/column/' + self.id, {
      				method: 'PUT',
      				headers: myHeaders,
    					body: JSON.stringify({
								name: columnName
							}),
    			})
    			.then(function(res) {
    			  	return res.json();
    			})
    			.then(function(resp) {
    				self.renameColumn(columnName);
				});
			}
		})
	}
	Column.prototype = {
		renameColumn: function(columnName) {
			this.element.querySelector('.column-title').innerText = columnName
		},
		addCard: function(card) {
			this.element.querySelector('ul').appendChild(card.element);
		},
		removeColumn: function() {
      		var self = this;
			fetch(baseUrl + '/column/' + self.id, { method: 'DELETE', headers: myHeaders })
    			.then(function(resp) {
    				return resp.json();
    			})
    			.then(function(resp) {
    				self.element.parentNode.removeChild(self.element);
    			});
    	}
	};
	//creation of the Card class
	function Card(id, description) {
		var self = this;

		this.id = id;
		this.description = description;
		this.element = generateTemplate('card-template', { description: this.description, id: this.id }, 'li');

		this.element.querySelector('.card').addEventListener('click', function (event) {
			event.stopPropagation();

			if (event.target.classList.contains('btn-delete')) {
				self.removeCard();
			}
			if (event.target.classList.contains('btn-rename')) {
				var cardName = prompt("Enter a new name");
				event.preventDefault();
				var data = new FormData();
				data.append('name', cardName);

				fetch(baseUrl + '/card/' + self.id, {
      				method: 'PUT',
      				headers: myHeaders,
							body: JSON.stringify({
								name: cardName,
								bootcamp_kanban_column_id: self.element.parentNode.id
							}),
    			})
    			.then(function(res) {
    			  	return res.json();
    			})
    			.then(function(resp) {
    				self.element.innerHTML = generateTemplate('card-template', { description: cardName, id: self.id }, 'li').innerHTML;
				});
			}
		});
	}
	Card.prototype = {
		renameCard: function(card) {
			this.element.querySelector('ul').appendChild(card.element);
		},
		removeCard: function() {
			var self = this;

			fetch(baseUrl + '/card/' + self.id, { method: 'DELETE', headers: myHeaders })
    			.then(function(resp) {
    			  	return resp.json();
    			})
    			.then(function(resp) {
    			  	self.element.parentNode.removeChild(self.element);
    			})
    	}
	};
	//creating an array object
	var board = {
		name: 'Kanban board',
		addColumn: function (column) {
			this.element.appendChild(column.element);
			initSortable(column.id);
			randomColors();
		},
		element: document.querySelector('#board .column-container')
	};

	function initSortable(id) {
		var el = document.getElementById(id);
		var sortable = Sortable.create(el, {
    		group: 'kanban',
    		sort: true,
    			onAdd: function (event) {
					var cardName = event.item.querySelector('.card-description').innerText;
					var columnId = event.target.id;
					var cardId = event.item.querySelector('.card').id;

					fetch(baseUrl + '/card/' + cardId, {
	            	method: 'PUT',
	            	headers: myHeaders,
	            	body: JSON.stringify({
									bootcamp_kanban_column_id: columnId,
									name: cardName
								}),
	          	})

				},
  		});
	}
	//button click event for adding more columns
	document.querySelector('#board .create-column').addEventListener('click', function() {
    	
    	var name = prompt('Enter a column name');
    	var data = new FormData();
    	data.append('name', name);
    	
    	if (isNaN(name)) {
    		fetch(baseUrl + '/column', {
            	method: 'POST',
            	headers: myHeaders,
            	body: data,
          	})
          	.then(function(resp) {
            	return resp.json();
          	})
          	.then(function(resp) {
            	var column = new Column(resp.id, name);
            	board.addColumn(column);
          	});
    	} else {
    		//modal
    		document.querySelector('#overlay').classList.add('show');
    		document.querySelector('#modal').classList.add('show');

    		var hideModal = function() {
    			document.querySelector('#overlay').classList.remove('show');
    		};
    		document.querySelector('#overlay').addEventListener('click', hideModal);

    		document.addEventListener('keyup', function(e) {
  				if(e.keyCode === 27) {
    				hideModal();
				}
			});
    		var modals = document.querySelectorAll('.modal');
    		for(var i = 0; i < modals.length; i++){
				modals[i].addEventListener('click', function(event){
					event.stopPropagation();
				});
			}
		}
	});	
});

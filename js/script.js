'use strict'

document.addEventListener('DOMContentLoaded', function() {
	//generating an id that consists of 10 randomly selected characters
	function randomString() {
    	var chars = '0123456789abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ';
    	var str = '';
    	for (var i = 0; i < 10; i++) {
    	    str += chars[Math.floor(Math.random() * chars.length)];
    	};
    	return str;
	};
	//Generating templates
	function generateTemplate(name, data, basicElement) {
		var template = document.getElementById(name).innerHTML;
		var element = document.createElement(basicElement || 'div');

		Mustache.parse(template);
		element.innerHTML = Mustache.render(template, data);

		return element;
	};
	//creation of the Column class
			
	function randomColors() {
			var colors = ['#0099CC', '#00CCFF', '#33FFFF', '#66FFFF', '#99FFFF', '#CCFFFF', '#FFFFFF', '#FF66CC', '#FF99FF', '#FFCCFF', '#009966', '#33CC99', '#66FFCC'];
  			var columns = document.querySelectorAll('.column');

  			for( var i = 0; i < columns.length; i++ ) {
  				var backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  				
  				while (i > 0 && backgroundColor == columns[i-1].style["background-color"]) {
  					backgroundColor = colors[Math.floor(Math.random() * colors.length)];  					
  				}
  				columns[i].style["background-color"] = backgroundColor;
  				columns[i].color = backgroundColor;
  			}
		}

	function Column(name) {
		
		
		
		// var colors = ['#0099CC', '#00CCFF', '#33FFFF', '#66FFFF', '#99FFFF', '#CCFFFF', '#FFFFFF', '#FF66CC', '#FF99FF', '#FFCCFF', '#009966', '#33CC99', '#66FFCC'];
		var backgroundColor = '#FFFFFF';
		
		var self = this;

		this.id = randomString();
		this.name = name;
		this.element = generateTemplate('column-template', {name: this.name, id: this.id, color: backgroundColor});
		//Delete and add the column after clicking the button
		this.element.querySelector('.column').addEventListener('click', function (event) {
			if (event.target.classList.contains('btn-delete')) {
				self.removeColumn();
			} 
			if (event.target.classList.contains('add-card')) {
				self.addCard(new Card(prompt("Enter the name of the card")));
			}
		});
	};
	Column.prototype = {
		addCard: function(card) {
			this.element.querySelector('ul').appendChild(card.element);
		},
		removeColumn: function() {
      		this.element.parentNode.removeChild(this.element);
      		randomColors();
    	}
	};
	//creation of the Card class
	function Card(description) {
		var self = this;

		this.id = randomString();
		this.description = description;
		this.element = generateTemplate('card-template', { description: this.description }, 'li');

		this.element.querySelector('.card').addEventListener('click', function (event) {
			event.stopPropagation();

			if (event.target.classList.contains('btn-delete')) {
				self.removeCard();
			}
		});
	};
	Card.prototype = {
		removeCard: function() {
			this.element.parentNode.removeChild(this.element);
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
    		sort: true
  		});
	};

	//button click event for adding more columns
	document.querySelector('#board .create-column').addEventListener('click', function() {
    	var name = prompt('Enter a column name');
    	
    	if (isNaN(name)) {
    		var column = new Column(name);
    		board.addColumn(column);
    	} else {
    		//modal
    		document.querySelector('#overlay').classList.add('show');
    		document.querySelector('#modal').classList.add('show');

    		var hideModal = function() {
    			document.querySelector('#overlay').classList.remove('show');
    		}
    		document.querySelector('#overlay').addEventListener('click', hideModal);

    		document.addEventListener('keyup', function(e) {
  				if(e.keyCode === 27) {
    				hideModal();
  				};
			});
    		var modals = document.querySelectorAll('.modal');
    		for(var i = 0; i < modals.length; i++){
				modals[i].addEventListener('click', function(event){
					event.stopPropagation();
				});
			};
    	}

	});

	//creating columns
	var todoColumn = new Column('To do');
	var doingColumn = new Column('Doing');
	var doneColumn = new Column('Done');

	//adding columns to the board
	board.addColumn(todoColumn);
	board.addColumn(doingColumn);
	board.addColumn(doneColumn);

	//creating cards
	var card1 = new Card('New task');
	var card2 = new Card('Create kanban boards');

	//adding cards to columns
	todoColumn.addCard(card1);
	doingColumn.addCard(card2);
});
/*
//creation of the Board class
	function Board(name) {
		var self = this;

		this.id = randomString();
		this.name = name;
		this.element = generateTemplate('board-template ', {name: this.name, id: this.id});
		//Delete and add the board after clicking the button
		this.element.querySlelector('.board').addEventListener('click', function(event) {
			
			if (event.target.classList.contains('create-column')) {
				self.addBoard(new Board(prompt("Enter the name of the board")));
			}
		});
	};
	Board.prototype = {
		addBoard: function(board) {
			this.element.querySlelector('div').appendChild(board.element);
		},
	};
*/
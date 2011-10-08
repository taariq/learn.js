var $ = require('jquery-browserify');
var cookie = require('cookie-cutter');
var vm = require('vm');

var stringify = require('./stringify');
var namesList = require('./names_list');

module.exports = function (remote, conn) {
    var names = namesList(remote, conn);
    
    remote.myNameIs($('#name').val());
    
    var to = null;
    function setName () {
        var name = $(this).val();
        var ex = new Date;
        ex.setDate(ex.getDate() + 30);
        cookie.set('name', name, { expires : ex });
        
        if (!to) to = setTimeout(function () {
            remote.myNameIs(name);
            to = null;
        }, 250);
    }
    $('#name')
        .change(setName)
        .keydown(setName)
        .submit(function (ev) {
            ev.preventDefault();
        })
    ;
    
    remote.units(function (units) {
        units.forEach(function (unit, i) {
            var elem = $('<div>')
                .addClass('unit')
                .appendTo($('#units'))
            ;
            $('<div>')
                .addClass('unit-title')
                .text(unit.title || '')
                .appendTo(elem)
            ;
            $('<div>')
                .addClass('unit-body')
                .html(unit.body || '')
                .appendTo(elem)
            ;
        });
        
        $('.repl').each(function () {
            var output = $('<div>')
                .addClass('output')
                .appendTo(this)
            ;
            
            $('<span>').text('>').appendTo(this);
            
            var context = {};
            vm.runInNewContext('1+1', context);
            var ignore = Object.keys(context).reduce(function (acc, key) {
                acc[key] = context[key];
                return acc;
            }, {});
            context = {};
            
            var form = $('<form>').submit(function (ev) {
                ev.preventDefault();
                
                var s = input.val();
                try {
                    var res = vm.runInNewContext(s, context);
                    context = Object.keys(context)
                        .reduce(function (acc, key) {
                            if (!ignore.hasOwnProperty(key)) {
                                acc[key] = context[key];
                            }
                            return acc;
                        }, {})
                    ;
                }
                catch (err) {
                    $('<div>')
                        .addClass('error')
                        .text(err.toString())
                        .appendTo(output)
                    ;
                    $(this).scrollTop(100000);
                    return;
                }
                
                input.val('');
                $('<div>')
                    .addClass('prev')
                    .text('> ' + s)
                    .appendTo(output)
                ;
                
                if (res === undefined) {
                    
                }
                else if (typeof res === 'object') {
                    $('<div>')
                        .text(stringify(res))
                        .appendTo(output)
                    ;
                }
                else {
                    $('<div>')
                        .text(res.toString())
                        .appendTo(output)
                    ;
                }
            }).appendTo(this);
            
            var input = $('<input>').appendTo(form);
            
            $(this).click(function () {
                input.trigger('focus');
            });
        });
    });
};

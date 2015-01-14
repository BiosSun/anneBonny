(function(angular, $, moment) {
    var _toString = Object.prototype.toString,

        CLASS_NAME = 'annebonny',
        INNER_CLASS_NAME = CLASS_NAME + '-inner',
        CONTAINER_CLASS_NAME = CLASS_NAME + '-container';

    function DatePicker() {
    }

    DatePicker.defaultOptions = {
        type: 'date',
        pickerType: 'panel',
        events: {}
    };

    DatePicker.prototype = {
        // 获取默认日期
        defaultDate: function() { return new Date(); },

        /**
         * 设置日期
         */
        setValue: function(val) {
            this._mdate = this._getMomentDate(val) || this._getMomentDate(this.defaultDate);
            return this;
        },

        getValue: function() {
            return this._mdate;
        },

        /**
         * 触发事件
         */
        trigger: function(name) {
            var cal = this.options.events[name],
                params = Array.prototype.slice.call(arguments, 1);

            params.unshift(this);

            if (cal) {
                cal.apply(this, params);
            }
        },

        /**
         * 修改当前日期
         */
        _changeValue: function(key, number) {
            this._mdate.set(key, number);

            this.trigger('change', key, number);

            if (moment.normalizeUnits(key) === 'date') {
                this.close();
            }
        },

        /**
         * 刷新选择面板
         */
        reset: function(options) {
            options = $.extend({}, DatePicker.defaultOptions, options);

            // 创建选择框
            if (!this._picker) {
                this._createPicker();
            }

            // 刷新选择框
            this._resetPicker(options);

            // 创建一个新的容器
            var container = this._createContainer(options).appendTo(this._pickerInner);
            this._container && this._container.remove();
            this._container = container;

            this.options = options;

            return this;
        },

        /**
         * 打开日期选择框
         */
        open: function(options) {
            if (!this._picker) {
                this._createPicker();
            }

            this._picker.show();
        },

        /**
         * 关闭选择面板
         */
        close: function() {
            this._picker.hide();
        },

        /**
         * 创建选择框
         */
        _createPicker: function(options) {
            var self = this, picker, pickerInner;

            picker = $('<div class="' + CLASS_NAME + '" />');
            pickerInner = $('<div />').addClass(INNER_CLASS_NAME).appendTo(picker);

            picker.hide();
            picker.appendTo($('body'));

            picker.on('change.annebonny', function(event, key, number) {
                self._changeValue(key, number);
            });

            this._picker = picker;
            this._pickerInner = pickerInner;
        },

        /**
         * 重置选择框
         */
        _resetPicker: function(newOptions) {
            if (this.options) {
                this._picker.removeClass(CLASS_NAME + '-' + this.options.pickerType);
            }

            this._picker.addClass(CLASS_NAME + '-' + newOptions.pickerType);
        },

        /**
         * 创建容器
         */
        _createContainer: function(options) {
            var type = options.type;

            switch (type) {
                case 'date' :
                    return this._createCalendarContainer();
                default:
                    return $('<div class="' + CONTAINER_CLASS_NAME + '-unsupported' + '">不支持的日期类型</div>');
            }
        },

        /**
         * 创建日历容器
         */
        _createCalendarContainer: function() {
            var self = this,

                calendar = $('<div class="' + CONTAINER_CLASS_NAME + '-calendar' + '"></div>'),
                hd = this._createCalendarHeader(),
                bd = this._createCalendarPage(this._mdate);

            calendar.append(hd).append(bd);

            this._picker.on('change.annebonny', function(event, key, number) {
                key = moment.normalizeUnits(key);
                if (key === 'year' || key == 'month') {
                    bd.remove();
                    bd = self._createCalendarPage(self._mdate);
                    calendar.append(bd);
                }
            });

            return calendar;
        },

        /**
         * 创建日历容器头部
         */
        _createCalendarHeader: function() {
            var hd = $('<div class="hd"></div>');

            hd.append($('<div class="col year-col" />').append(this._createYearSelect()))
                .append($('<div class="col month-col" />').append(this._createMonthSelect()));

            return hd;
        },

        /**
         * 创建年份选择器
         */
        _createYearSelect: function() {
            var self = this,

                nowYear = this._mdate.year(),
                beginYear = nowYear - 20,
                endYear = beginYear + 40,

                selectHtml = '<select class="year">';

            for (; beginYear <= endYear; beginYear++) {
                selectHtml += '<option value="' + beginYear + '" ' + (beginYear === nowYear ? 'selected' : '') + '>' + beginYear + '</option>';
            }

            selectHtml += '</select>';

            return $(selectHtml).on('change.annebonny', function() {
                var val = parseInt($(this).val(), 10);
                self._picker.trigger('change.annebonny', ['year', val]);
            });
        },

        /**
         * 创建月份选择器
         */
        _createMonthSelect: function() {
            var self = this,

                nowMonth = this._mdate.month(),
                selectHtml = '<select class="month">';

            for (var i = 0;  i < 12; i++) {
                selectHtml += '<option value="' + i + '" ' + (i === nowMonth ? 'selected' : '') + '>' + (i + 1) + '</option>';
            }

            selectHtml += '</select>';

            return $(selectHtml).on('change.annebonny', function() {
                var val = parseInt($(this).val(), 10);
                self._picker.trigger('change.annebonny', ['month', val]);
            });
        },

        /**
         * 创建一张日历
         */
        _createCalendarPage: function(mdate) {
            mdate = moment(mdate);

            var self = this,

                monthLength     = moment(mdate).endOf('month').date(),
                prevMonthLength = moment(mdate).subtract(1, 'month').endOf('month').date(),
                monthFirstDay   = moment(mdate).startOf('month').day(),
                nowDay = mdate.date(),

                page = $('<div class="' + CLASS_NAME + '-calendar-page"></div>'),
                pageHd = $('<div class="hd"></div>').appendTo(page),
                pageBd = $('<div class="bd"></div>').appendTo(page),

                daysHtml = '',
                daysCount = 0,

                i, l;

            pageHd.append(this._createWeekBar());

            daysHtml += '<div class="line">';

            for (i = prevMonthLength - monthFirstDay + 1; i <= prevMonthLength; i++) {
                daysHtml += col(i, 'prev-month');
            }

            for (i = 1; i <= monthLength; i++) {
                daysHtml += col(i, (i === nowDay ? 'now' : '') + ' ' + (i === mdate.date() ? 'selected' : ''));
            }

            l = (7 - (monthFirstDay + monthLength) % 7) % 7;
            for (i = 1; i <= l; i++) {
                daysHtml += col(i, 'next-month');
            }

            pageBd.append(daysHtml);

            // 绑定点击事件
            pageBd.on('click', '.day', function() {
                console.info('date');
                var dayCol = $(this);
                self._picker.triggerHandler( 'change.annebonny', ['date', parseInt(dayCol.text(), 10)]);
                dayCol.closest('.bd').find('.day.selected').removeClass('selected');
                dayCol.addClass('selected');
            });

            return page;

            function col(dayNumber, className) {
                var col = '<span class="col day ' + className + '">' + dayNumber + '</span>';
                if (++daysCount % 7 === 0) {
                    col += '</div><div class="line">';
                }
                return col;
            }
        },

        /**
         * 创建星期条
         */
        _createWeekBar: function() {
            var weekBar = '<div class="' + CLASS_NAME + '-week-bar">',
                weekName = moment._locale._weekdaysMin;

            for (var i = 0; i < weekName.length; i++) {
                weekBar += '<span class="col">' + weekName[i] + '</span>';
            }

            weekBar += '</div>';

            return $(weekBar);
        },

        /**
         * 试图根据所传入的值创建一个有效的 moment 对象，如果无法创建或所创建的 moment 对象无效，
         * 则返回 undefined。
         */
        _getMomentDate: function(val, type) {
            var mdate;

            if (isDate(val) || isString(val) || isNumber(val)) {
                mdate =  moment(val);
            }
            else if (isFunction(val)) {
                mdate = moment(val());
            }

            return mdate && mdate.isValid() ? mdate : undefined;
        }
    };

    var datePicker = new DatePicker();

    function isString(obj) {
        return typeof obj === 'string';
    }

    function isNumber(obj) {
        return typeof obj === 'number';
    }

    function isFunction(obj) {
        return typeof obj === 'function';
    }

    function isDate(obj) {
        return _toString.call(obj) === '[object Date]';
    }

    /**
     * Angular 的指令
     */
    angular.module('anneBonny', [])
        .directive('annebonnyDatePicker', function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function($scope, $el, $attrs, ngModel) {
                    var type = $el.attr('type') || 'date';

                    if (type === 'text') {
                        type = 'date';
                    }

                    $el.attr('readonly', true);

                    $el.on('click', function(event) {
                        datePicker.setValue(ngModel.$modelValue).reset({
                            type: type,
                            events: {
                                change: function(anneBonny, key, number) {
                                        ngModel.$setViewValue(anneBonny.getValue().format('YYYY-MM-DD'));
                                        ngModel.$commitViewValue();
                                        ngModel.$render();
                                }
                            }
                        }).open();
                        event.preventDefault();
                    });
                }
            };
        });

})(angular, jQuery, moment);

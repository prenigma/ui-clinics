Bahmni.ConceptSet.Observation = function (observation, savedObs, conceptUIConfig) {
    var self = this;
    angular.extend(this, observation);
    this.isObservation = true;
    this.conceptUIConfig = conceptUIConfig[this.concept.name] || []
    this.uniqueId = _.uniqueId('observation_');
    this.erroneousValue = null;

    if (savedObs) {
        this.uuid = savedObs.uuid;
        this.value = savedObs.value;
        this.observationDateTime = savedObs.observationDateTime;
        this.provider = savedObs.provider;
    } else {
        this.value = this.conceptUIConfig.defaultValue;         
    }

    if(this.conceptUIConfig.autocomplete && this.conceptUIConfig.answersConceptName) {
        Object.defineProperty(this, 'autocompleteValue', {
            enumerable: true,
            get: function () {
                return (this.value != null && (typeof this.value === "object")) ? this.value.name: this.value;
            },
            set: function (newValue) {
                this.value = newValue;
            }
        });
    }


    Object.defineProperty(this, 'value', {
                enumerable: true,
                get: function () {
                    if(self._value!=null){
                        return self._value;
                    }
                    savedObs && savedObs.value ? savedObs.value['displayString'] = (savedObs.value.shortName ? savedObs.value.shortName : savedObs.value.name) : '';
                    return savedObs ? savedObs.value : undefined;
                },
                set: function (newValue) {
                    self._value = newValue;
                    if (!newValue) {
                        savedObs = null;
                    }
                    self.onValueChanged();
                }
            });

    this.cloneNew = function() {
        var oldObs = angular.copy(observation);
        if(oldObs.groupMembers && oldObs.groupMembers.length > 0) {
            oldObs.groupMembers = _.filter(oldObs.groupMembers, function(member) {
                return !member.isMultiSelect;
            });
            oldObs.groupMembers = _.map(oldObs.groupMembers, function(member) {
                return member.cloneNew();
            });
        }
        new Bahmni.ConceptSet.MultiSelectObservations(conceptUIConfig).map(oldObs.groupMembers);
        var clone = new Bahmni.ConceptSet.Observation(oldObs, null, conceptUIConfig);
        clone.comment = undefined;
        return clone;
    };
};

Bahmni.ConceptSet.Observation.prototype = {
    displayValue: function () {
        if (this.possibleAnswers.length > 0) {
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                if (this.possibleAnswers[i].uuid === this.value) {
                    return this.possibleAnswers[i].display;
                }
            }
        }
        else {
            return this.value;
        }
    },

    isGroup: function () {
        if (this.groupMembers)
            return this.groupMembers.length > 0;
        return false;
    },

    isComputed: function() {
        return this.concept.conceptClass === "Computed";
    },

    isComputedAndEditable: function() {
        return this.concept.conceptClass === "Computed/Editable";
    },

    isNumeric: function () {
        return this.getDataTypeName() === "Numeric";
    },

    isText: function () {
        return this.getDataTypeName() === "Text";
    },

    isCoded: function () {
        return this.getDataTypeName() === "Coded";
    },

    isDatetime: function() {
        return this.getDataTypeName() === "Datetime";
    },

    isImage: function () {
        return this.concept.conceptClass == Bahmni.Common.Constants.imageClassName;
    },

    getDataTypeName: function () {
        return this.concept.dataType;
    },
    
    isDateDataType: function () {
        return 'Date'.indexOf(this.getDataTypeName()) != -1;
    },

    getPossibleAnswers: function() {
        return this.possibleAnswers;
    },

    getHighAbsolute: function () {
        return this.concept.hiAbsolute;
    },

    getLowAbsolute: function () {
        return this.concept.lowAbsolute;
    },

    isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.getDataTypeName()) != -1;
    },

    isGrid: function () {
        return this.conceptUIConfig.grid;
    },

    isButtonRadio: function () {
        return this.conceptUIConfig.buttonRadio;
    },

    getControlType: function () {
        if (this.hidden) return "hidden";
        if (this.conceptUIConfig.freeTextAutocomplete) return "freeTextAutocomplete";
        if (this.isHtml5InputDataType()) return "html5InputDataType";
        if (this.isImage()) return "image";
        if (this.isText()) return "text";
        if (this.isCoded()) return this._getCodedControlType();
        if (this.isGrid()) return "grid";
        if (this.isDatetime()) return "datetime";
        return "unknown";
    },

    canHaveComment: function() {
        return this.conceptUIConfig.disableAddNotes ? !this.conceptUIConfig.disableAddNotes : (!this.isText() && !this.isImage());
    },

    canAddMore: function() {
        return this.conceptUIConfig.allowAddMore == true;
    },

    isStepperControl: function() {
        if(this.isNumeric()){
            return this.conceptUIConfig.stepper;
        }
    },

    isConciseText: function(){
        return this.conceptUIConfig.conciseText == true;
    },

    _getCodedControlType: function () {
        var conceptUIConfig = this.conceptUIConfig;
        if (conceptUIConfig.autocomplete) return "autocomplete";
        return "buttonselect";

    },

    onValueChanged: function () {
        if (this.isNumeric()) {
            this.setErroneousValue();
        }
    },

    setErroneousValue: function () {
            if (this.hasValue()) {
                var erroneousValue = this.value > (this.concept.hiAbsolute || Infinity) || this.value < (this.concept.lowAbsolute || 0);
                this.erroneousValue = erroneousValue;
            } else {
                this.erroneousValue = undefined;
            }
        },

    getInputType: function () {
        return this.getDataTypeName();
    },

    atLeastOneValueSet: function () {
        if (this.isGroup()) {
            return this.groupMembers.some(function (childNode) {
                return childNode.atLeastOneValueSet();
            })
        } else {
            return this.hasValue();
        }
    },

    hasValue: function () {
        var value = this.value;
        if (value === false) return true;
        if (value === 0) return true; //!value ignores 0
        if (value === '' || !value) return false;
        if (value instanceof Array) return value.length > 0;
        return true;
    },

    hasValueOf: function(value) {
        if(!this.value || !value) return false;
        return this.value == value || this.value.uuid == value.uuid;
    },

    toggleSelection: function(answer) {
        if (this.value && this.value.uuid === answer.uuid) {
            this.value = null;
        } else {
            this.value = answer;
        }
    },

    isValidDate: function () {
        if (!this.hasValue()) return true;
        var date = Bahmni.Common.Util.DateUtil.parse(this.value);
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    },

    hasInvalidDateTime: function () {
        return this.value === "Invalid Datetime";
    },

    isValid: function (checkRequiredFields, conceptSetRequired) {

        if (this.error) return false;
        if (this.hidden) return true;
        if (checkRequiredFields) {
            if (this.isGroup()) return this._hasValidChildren(checkRequiredFields, conceptSetRequired);
            if (conceptSetRequired && this.isRequired() && !this.hasValue()) return false;
            if (this.isRequired() && !this.hasValue()) return false;
        }
        if (this._isDateDataType()) return this.isValidDate();
        if (this._isDateTimeDataType()) return !this.hasInvalidDateTime();
        if (this.erroneousValue) return false;
        return true;
    },

    isValueInAbsoluteRange: function () {
        if (this.erroneousValue) return false;
        if (this.isGroup()) return this._areChildNodesInAbsoluteRange();
        return true;
    },

    _isDateDataType: function () {
        return 'Date'.indexOf(this.getDataTypeName()) != -1;
    },

    _isDateTimeDataType: function () {
        return 'Datetime'.indexOf(this.getDataTypeName()) != -1;
    },

    isRequired: function () {
        return this.conceptUIConfig.required;
    },

    isFormElement: function() {
        return (!this.concept.set || this.isGrid()) && !this.isComputed();
    },

    _hasValidChildren: function (checkRequiredFields, conceptSetRequired) {
        return this.groupMembers.every(function (member) {
            return member.isValid(checkRequiredFields, conceptSetRequired)
        });
    },

    _areChildNodesInAbsoluteRange: function () {
        return this.groupMembers.every(function (member) {
            //Other than Bahmni.ConceptSet.Observation  and Bahmni.ConceptSet.ObservationNode, other concepts does not have isValueInAbsoluteRange fn
            return (typeof member.isValueInAbsoluteRange == 'function')? member.isValueInAbsoluteRange():true;
        });
    },

    markAsNonCoded: function() {
      this.markedAsNonCoded = !this.markedAsNonCoded;
    },

    toggleVoidingOfImage: function() {
        this.voided = !this.voided;
    },

    assignAddMoreButtonID : function(){
        return this.concept.name.split(' ').join('_').toLowerCase() + '_addmore_' + this.uniqueId;
    }
};
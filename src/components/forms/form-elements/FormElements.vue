<template>
  <div class="form-elements">
    <div class="row">
      <div class="col-md-12">
        <vuestic-widget :header-text="'forms.inputs.title' | translate">
          <form>
            <div class="row">
              <div class="col-md-4">
                <fieldset>
                  <div class="form-group">
                    <div class="input-group">
                      <input id="simple-input" required />
                      <label class="control-label" for="simple-input">{{ 'forms.inputs.textInput' | translate }}</label
                      ><i class="bar"></i>
                    </div>
                  </div>
                  <div
                    class="form-group with-icon-right"
                    :class="{
                      'has-error': errors.has('successfulEmail'),
                      valid: isSuccessfulEmailValid,
                    }"
                  >
                    <div class="input-group">
                      <input
                        id="successfulEmail"
                        v-model="successfulEmail"
                        v-validate="'required|email'"
                        name="successfulEmail"
                        required
                      />
                      <i class="fa fa-exclamation-triangle error-icon icon-right input-icon"></i>
                      <i class="fa fa-check valid-icon icon-right input-icon"></i>
                      <label class="control-label" for="successfulEmail"
                        >{{ 'forms.inputs.emailValidatedSuccess' | translate }} </label
                      ><i class="bar"></i>
                      <small v-show="errors.has('successfulEmail')" class="help text-danger">
                        {{ errors.first('successfulEmail') }}
                      </small>
                    </div>
                  </div>
                  <div class="form-group with-icon-right" :class="{ 'has-error': errors.has('wrongEmail') }">
                    <div class="input-group">
                      <input
                        id="wrongEmail"
                        v-model="wrongEmail"
                        v-validate="'required|email'"
                        name="wrongEmail"
                        required
                      />
                      <i v-show="errors.has('wrongEmail')" class="fa fa-exclamation-triangle icon-right input-icon"></i>
                      <label class="control-label" for="wrongEmail">{{
                        'forms.inputs.emailValidated' | translate
                      }}</label
                      ><i class="bar"></i>
                      <small v-show="errors.has('wrongEmail')" class="help text-danger"
                        >{{ errors.first('wrongEmail') }}
                      </small>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <textarea id="simple-textarea" type="text" required></textarea>
                      <label class="control-label" for="simple-textarea">{{
                        'forms.inputs.textArea' | translate
                      }}</label
                      ><i class="bar"></i>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div class="col-md-4">
                <fieldset>
                  <div class="form-group with-icon-left">
                    <div class="input-group">
                      <input id="input-icon-left" name="input-icon-left" required />
                      <i class="fa fa-envelope-o icon-left input-icon"></i>
                      <label class="control-label" for="input-icon-left">{{
                        'forms.inputs.inputWithIcon' | translate
                      }}</label
                      ><i class="bar"></i>
                    </div>
                  </div>
                  <div class="form-group with-icon-right">
                    <div class="input-group">
                      <input id="clear-input" v-model="clearableText" name="clear-input" required />
                      <i class="fa fa-times icon-right input-icon pointer" @click="clear('clearableText')"></i>
                      <label class="control-label" for="clear-input" role="button">{{
                        'forms.inputs.inputWithClearButton' | translate
                      }}</label
                      ><i class="bar"></i>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <input id="inputWithDescription" required title="" />
                      <label class="control-label" for="simple-input">{{
                        'forms.inputs.textInputWithDescription' | translate
                      }}</label
                      ><i class="bar"></i>
                      <small class="help text-secondary">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                      </small>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div class="col-md-4">
                <fieldset>
                  <div class="form-group form-group-w-btn">
                    <div class="input-group">
                      <input id="input-w-btn" required />
                      <label class="control-label" for="input-w-btn">{{
                        'forms.inputs.inputWithButton' | translate
                      }}</label
                      ><i class="bar"></i>
                    </div>
                    <div class="btn btn-micro btn-primary">
                      {{ 'forms.inputs.upload' | translate }}
                    </div>
                  </div>
                  <div class="form-group form-group-w-btn">
                    <div class="input-group">
                      <input id="input-w-btn-round" required />
                      <label class="control-label" for="input-w-btn-round">{{
                        'forms.inputs.inputWithRoundButton' | translate
                      }}</label
                      ><i class="bar"></i>
                    </div>
                    <div class="btn btn-primary btn-with-icon btn-micro rounded-icon">
                      <div class="btn-with-icon-content">
                        <i class="ion-md-cloud-outline ion"></i>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </form>
        </vuestic-widget>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <vuestic-widget :header-text="$t('forms.dateTimePicker.title')">
          <form>
            <div class="row">
              <div class="col-md-4">
                <fieldset>
                  <div class="form-group">
                    <div class="input-group">
                      <vuestic-date-picker id="date-picker-basic" v-model="datepicker.simple" />
                      <label class="control-label" for="date-picker-basic">
                        {{ $t('forms.dateTimePicker.basic') }}
                      </label>
                      <i class="bar"></i>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <vuestic-date-picker
                        id="date-picker-time"
                        v-model="datepicker.time"
                        :config="{ enableTime: true }"
                      />
                      <label class="control-label" for="date-picker-time">
                        {{ $t('forms.dateTimePicker.time') }}
                      </label>
                      <i class="bar"></i>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <vuestic-date-picker
                        id="date-picker-time"
                        v-model="datepicker.time"
                        :config="{ locale: { firstDayOfWeek: 1 } }"
                      />
                      <label class="control-label" for="date-picker-time">
                        {{ $t('forms.dateTimePicker.customFirstDay') }}
                      </label>
                      <i class="bar"></i>
                    </div>
                  </div>
                </fieldset>
              </div>
              <div class="col-md-4">
                <fieldset>
                  <div class="form-group">
                    <div class="input-group">
                      <vuestic-date-picker
                        id="date-picker-disabled"
                        v-model="datepicker.disabled"
                        :config="{ disable: datePickerDisabled }"
                      />
                      <label class="control-label" for="date-picker-disabled">
                        {{ $t('forms.dateTimePicker.disabled') }}
                      </label>
                      <i class="bar"></i>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <vuestic-date-picker
                        id="date-picker-multiple"
                        v-model="datepicker.multiple"
                        :config="{ mode: 'multiple' }"
                      />
                      <label class="control-label" for="date-picker-multiple">
                        {{ $t('forms.dateTimePicker.multiple') }}
                      </label>
                      <i class="bar"></i>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <vuestic-date-picker
                        id="date-picker-time"
                        v-model="datepicker.time"
                        :config="{ altInput: true, altFormat: 'F j, Y' }"
                      />
                      <label class="control-label" for="date-picker-time">
                        {{ $t('forms.dateTimePicker.customDateFormat') }}
                      </label>
                      <i class="bar"></i>
                    </div>
                  </div>
                </fieldset>
              </div>
              <div class="col-md-4">
                <fieldset>
                  <div class="form-group">
                    <div class="input-group">
                      <vuestic-date-picker
                        id="date-picker-range"
                        v-model="datepicker.range"
                        :config="{ mode: 'range', inline: true }"
                      />
                      <label class="control-label" for="date-picker-range">
                        {{ $t('forms.dateTimePicker.range') }}
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </form>
        </vuestic-widget>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <vuestic-widget :header-text="'forms.selects.title' | translate">
          <form>
            <div class="row">
              <div class="col-md-4">
                <fieldset>
                  <vuestic-simple-select
                    v-model="simpleSelectModel"
                    :label="'forms.selects.simple' | translate"
                    option-key="description"
                    :options="simpleOptions"
                  />
                  <vuestic-simple-select
                    v-model="chosenCountry"
                    :label="'forms.selects.country' | translate"
                    :options="countriesList"
                  />
                </fieldset>
              </div>
              <div class="col-md-4">
                <fieldset>
                  <vuestic-multi-select
                    v-model="multiSelectModel"
                    :label="'forms.selects.multi' | translate"
                    option-key="description"
                    :options="simpleOptions"
                  />
                  <vuestic-multi-select
                    v-model="multiSelectCountriesModel"
                    :label="'forms.selects.countryMulti' | translate"
                    :options="countriesList"
                  />
                </fieldset>
              </div>
            </div>
          </form>
        </vuestic-widget>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <vuestic-widget :header-text="'forms.controls.title' | translate">
          <form>
            <div class="row">
              <div class="col-md-3">
                <fieldset>
                  <vuestic-checkbox
                    :id="'checkbox1'"
                    v-model="checkboxOneModel"
                    :label="'forms.controls.subscribe' | translate"
                  />
                  <vuestic-checkbox
                    :id="'checkbox2'"
                    v-model="checkboxTwoModel"
                    :label="'forms.controls.subscribe' | translate"
                  />
                  <vuestic-checkbox
                    :id="'checkbox3'"
                    v-model="checkboxThreeModel"
                    :label="'forms.controls.subscribe' | translate"
                    :disabled="true"
                  />
                  <vuestic-checkbox
                    :id="'checkbox4'"
                    v-model="checkboxFourModel"
                    :label="'forms.controls.subscribe' | translate"
                    :disabled="true"
                  />
                </fieldset>
              </div>

              <div class="col-md-3">
                <fieldset>
                  <vuestic-checkbox
                    :id="'checkbox5'"
                    v-model="checkboxFiveModel"
                    :label="'forms.controls.subscribe' | translate"
                    :is-circle="true"
                  />
                  <vuestic-checkbox
                    :id="'checkbox6'"
                    v-model="checkboxSixModel"
                    :label="'forms.controls.subscribe' | translate"
                    :is-circle="true"
                  />
                  <vuestic-checkbox
                    :id="'checkbox7'"
                    v-model="checkboxSevenModel"
                    :label="'forms.controls.subscribe' | translate"
                    :disabled="true"
                    :is-circle="true"
                  />
                  <vuestic-checkbox
                    :id="'checkbox8'"
                    v-model="checkboxEightModel"
                    :label="'forms.controls.subscribe' | translate"
                    :disabled="true"
                    :is-circle="true"
                  />
                </fieldset>
              </div>

              <div class="col-md-3">
                <fieldset>
                  <vuestic-radio-button
                    :id="'radio1'"
                    v-model="radioModel"
                    :label="'forms.controls.radio' | translate"
                    :value="'option1'"
                    :name="'radio'"
                  />
                  <vuestic-radio-button
                    :id="'radio2'"
                    v-model="radioModel"
                    :label="'forms.controls.radio' | translate"
                    :value="'option2'"
                    :name="'radio'"
                  />
                </fieldset>
                <fieldset>
                  <vuestic-radio-button
                    :id="'radio3'"
                    v-model="radioDisabledModel"
                    :label="'forms.controls.radioDisabled' | translate"
                    :value="'option3'"
                    :name="'disabled-radio'"
                    :disabled="true"
                  />
                  <vuestic-radio-button
                    :id="'radio4'"
                    v-model="radioDisabledModel"
                    :label="'forms.controls.radioDisabled' | translate"
                    :value="'option4'"
                    :name="'disabled-radio'"
                    :disabled="true"
                  />
                </fieldset>
              </div>

              <div class="col-md-3">
                <fieldset>
                  <vuestic-switch v-model="isMale">
                    <span slot="trueTitle">{{ 'forms.controls.male' | translate }}</span>
                    <span slot="falseTitle">{{ 'forms.controls.female' | translate }}</span>
                  </vuestic-switch>
                </fieldset>
              </div>
            </div>
          </form>
        </vuestic-widget>
      </div>
    </div>
  </div>
</template>

<script>
import CountriesList from 'data/CountriesList';

export default {
  name: 'form-elements',
  data() {
    return {
      isMale: true,
      countriesList: CountriesList,
      chosenCountry: '',
      clearableText: '',
      successfulEmail: 'andrei@dreamsupport.io',
      wrongEmail: 'andrei@dreamsupport',
      simpleOptions: [
        {
          id: 1,
          description: 'First option',
        },
        {
          id: 2,
          description: 'Second option',
        },
        {
          id: 3,
          description: 'Third option',
        },
      ],
      simpleSelectModel: '',
      multiSelectModel: [],
      multiSelectCountriesModel: [],
      radioModel: 'option1',
      radioDisabledModel: 'option4',
      checkboxOneModel: false,
      checkboxTwoModel: true,
      checkboxThreeModel: false,
      checkboxFourModel: true,
      checkboxFiveModel: false,
      checkboxSixModel: true,
      checkboxSevenModel: false,
      checkboxEightModel: true,
      datepicker: {
        simple: '2018-05-09',
        time: '2018-05-08 14:10',
        range: '2018-05-08 to 2018-05-23',
        disabled: '2018-05-09',
        multiple: '2018-04-25, 2018-04-27',
      },
    };
  },
  computed: {
    datePickerDisabled: () => [(date) => !(date.getDate() % 5)],
    isSuccessfulEmailValid() {
      let isValid = false;
      if (this.formFields.successfulEmail) {
        isValid = this.formFields.successfulEmail.validated && this.formFields.successfulEmail.valid;
      }
      return isValid;
    },
  },
  created() {
    this.$nextTick(() => {
      this.$validator.validateAll();
    });
  },
  methods: {
    clear(field) {
      this[field] = '';
    },
  },
};
</script>

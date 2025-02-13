import PropTypes from 'prop-types';
import React from 'react';
import { uniqueId, isString } from '../../helpers/utilities';
import classNames from 'classnames';
import ExpandingGroup from '../ExpandingGroup/ExpandingGroup';
import { makeField } from '../../helpers/fields';

import dispatchAnalyticsEvent from '../../helpers/analytics';

/**
 * A checkbox button group with a label.
 */
class CheckboxGroup extends React.Component {
  UNSAFE_componentWillMount() {
    this.inputId = this.props.id || uniqueId('errorable-checkbox-buttons-');
  }

  getMatchingSubSection = (checked, optionValues) => {
    if (checked && this.props.children) {
      const children = Array.isArray(this.props.children)
        ? this.props.children
        : [this.props.children];
      const subsections = children.filter(child =>
        optionValues.contains(child.props.showIfValueChosen),
      );
      return subsections.length > 0 ? subsections[0] : null;
    }

    return null;
  };

  handleChange = domEvent => {
    const isChecked = domEvent.target.checked;

    if (isChecked && this.props.enableAnalytics) {
      dispatchAnalyticsEvent({
        componentName: 'CheckboxGroup',
        action: 'change',

        details: {
          label: this.props.label,
          optionLabel: domEvent.target.value,
          required: this.props.required,
        },
      });
    }

    this.props.onValueChange(makeField(domEvent.target.value, true), isChecked);
  };

  render() {
    // TODO: extract error logic into a utility function
    // Calculate error state.
    let errorSpan = '';
    let errorSpanId = undefined;
    if (this.props.errorMessage) {
      errorSpanId = `${this.inputId}-error-message`;
      errorSpan = (
        <span className="usa-input-error-message" role="alert" id={errorSpanId}>
          <span className="sr-only">Error:</span> {this.props.errorMessage}
        </span>
      );
    }

    // Calculate required.
    let requiredSpan = undefined;
    if (this.props.required) {
      requiredSpan = <span className="form-required-span">(*Required)</span>;
    }

    const options = Array.isArray(this.props.options) ? this.props.options : [];
    const storedValues = this.props.values;
    const optionElements = options.map((obj, index) => {
      let optionLabel;
      let optionValue;
      let optionAdditional;
      if (isString(obj)) {
        optionLabel = obj;
        optionValue = obj;
      } else {
        optionLabel = obj.label;
        optionValue = obj.value;
        if (obj.additional) {
          optionAdditional = <div>{obj.additional}</div>;
        }
      }
      const checked = storedValues[optionValue];
      const matchingSubSection = this.getMatchingSubSection(
        checked,
        optionValue,
      );
      const checkboxButton = (
        <div
          key={optionAdditional ? undefined : index}
          className="form-checkbox-buttons"
        >
          <input
            checked={checked}
            id={`${this.inputId}-${index}`}
            name={this.props.name}
            type="checkbox"
            onMouseDown={this.props.onMouseDown}
            onKeyDown={this.props.onKeyDown}
            value={optionValue}
            onChange={this.handleChange}
          />
          <label
            name={`${this.props.name}-${index}-label`}
            htmlFor={`${this.inputId}-${index}`}
          >
            {optionLabel}
          </label>
          {matchingSubSection}
          {obj.content}
        </div>
      );

      let output = checkboxButton;

      // Return an expanding group for buttons with additional content
      if (optionAdditional) {
        output = (
          <ExpandingGroup
            additionalClass="form-expanding-group-active-checkbox"
            open={checked}
            key={index}
          >
            {checkboxButton}
            <div>{optionAdditional}</div>
          </ExpandingGroup>
        );
      }

      return output;
    });

    const fieldsetClass = classNames('fieldset-input', {
      'usa-input-error': this.props.errorMessage,
      [this.props.additionalFieldsetClass]: this.props.additionalFieldsetClass,
    });

    const legendClass = classNames('legend-label', {
      'usa-input-error-label': this.props.errorMessage,
      [this.props.additionalLegendClass]: this.props.additionalLegendClass,
    });

    return (
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>
          {this.props.label}
          {requiredSpan}
        </legend>
        {errorSpan}
        {optionElements}
      </fieldset>
    );
  }
}

CheckboxGroup.propTypes = {
  /**
   * Any additional fieldset classes.
   */
  additionalFieldsetClass: PropTypes.string,
  /**
   * Any additional legend classes.
   */
  additionalLegendClass: PropTypes.string,
  /**
   * Child elements (content)
   */
  children: PropTypes.node,
  /**
   * Error message.
   */
  errorMessage: PropTypes.string,
  /**
   * group field label.
   */
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  /**
   * name attribute.
   */
  name: PropTypes.string,
  /**
   * ID.
   */
  id: PropTypes.string,
  /**
   * Array of options to populate group.
   */
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        additional: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
      }),
    ]),
  ).isRequired,
  /**
   * Values of the checkbox field.
   */
  values: PropTypes.object.isRequired,
  /**
   * On mouse down event handler.
   */
  onMouseDown: PropTypes.func,
  /**
   * On key down event handler.
   */
  onKeyDown: PropTypes.func,
  /**
   * On value change event handler.
   */
  onValueChange: PropTypes.func.isRequired,
  /**
   * Is this field required.
   */
  required: PropTypes.bool,
  /**
   * Analytics tracking function(s) will be called. Form components
   * are disabled by default due to PII/PHI concerns.
   */
  enableAnalytics: PropTypes.bool,
};

export default CheckboxGroup;

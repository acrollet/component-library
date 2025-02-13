import React, { useState } from 'react';
import RadioButtons from '../../react-components/src/components/RadioButtons/RadioButtons';

export default {
  title: 'Components/RadioButtons',
  component: RadioButtons,
};

const Template = args => {
  const [value, setValue] = useState(args.value);
  const onChange = newVal => setValue(newVal);

  return (
    <div style={{ paddingLeft: '1em' }}>
      <RadioButtons {...args} value={value} onValueChange={onChange} />
    </div>
  );
};

const defaultArgs = {
  options: [
    'First option',
    {
      label: 'Second option with expanded content',
      value: 'option-two',
      additional:
        'This is the expanded content. It may be plain text or a React node.',
    },
    'Third option',
  ],
  label: 'This is a Label',
  value: { value: 'First option' },
  errorMessage: undefined,
};

export const Default = Template.bind({});
Default.args = { ...defaultArgs };

export const Error = Template.bind({});
Error.args = {
  ...defaultArgs,
  options: defaultArgs.options.concat(['Invalid option']),
  errorMessage: 'Invalid Option is Selected',
  value: {
    value: 'Invalid option',
  },
};

export const AriaDescribedby = Template.bind({});
AriaDescribedby.args = {
  ...defaultArgs,
  value: { value: 'First option' },
  ariaDescribedby: [
    'test1',
    'test2',
    null, // nothing to point to
  ],
};

export const WithAnalytics = Template.bind({});
WithAnalytics.args = {
  ...defaultArgs,
  value: { value: 'First option' },
  enableAnalytics: true,
};

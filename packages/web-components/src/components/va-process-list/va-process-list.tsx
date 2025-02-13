import { Component, h } from '@stencil/core';

/**
 * This component expects `<li>` elements as its children.
 */
@Component({
  tag: 'va-process-list',
  styleUrl: 'va-process-list.css',
  shadow: true,
})
export class VaProcessList {
  render() {
    return (
      <ol role="list">
        <slot></slot>
      </ol>
    );
  }
}

import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Prop,
  State,
  h,
} from '@stencil/core';
import { getSlottedNodes } from '../../utils/utils';

/**
 * Accordions are a list of headers that can be clicked to hide or reveal additional content.
 *
 * ## Usability
 * ### When to use
 * - Users only need a few specific pieces of content within a page.
 * - Information needs to be displayed in a small space.
 *
 * ### When to consider something else
 * - If visitors need to see most or all of the information on a page. Use well-formatted text instead.
 * - If there is not enough content to warrant condensing. Accordions increase cognitive load and interaction cost, as users have to make decisions about what headers to click on.
 *
 * ### Guidance
 *
 * - Allow users to click anywhere in the header area to expand or collapse the content; a larger target is easier to manipulate.
 * - Make sure interactive elements within the collapsible region are far enough from the headers that users don’t accidentally trigger a collapse. (The exact distance depends on the device.
 */

/**
 * @accordionItemToggled This event is fired when an accordion item is opened or closed
 */
@Component({
  tag: 'va-accordion',
  styleUrl: 'va-accordion.css',
  shadow: true,
})
export class VaAccordion {
  @Element() el!: any;
  expandCollapseBtn!: HTMLButtonElement;

  @State() expanded = false;

  /**
   * The event used to track usage of the component. This is emitted when an
   * accordion item is toggled and disableAnalytics is not true.
   */
  @Event({
    eventName: 'component-library-analytics',
    composed: true,
    bubbles: true,
  })
  componentLibraryAnalytics: EventEmitter;

  @Listen('accordionItemToggled')
  itemToggledHandler(event: CustomEvent) {
    // The event target is the button, and it has a parent which is a header.
    // It is the parent of the header (the root item) that we need to access
    // The final parentNode will be a shadowRoot, and from there we get the host.
    // https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/host
    const clickedItem =
      event.detail.currentTarget.parentNode.parentNode.host || // if we are on IE, `.host` won't be there
      event.detail.currentTarget.parentNode.parentNode;
    // Close the other items if this accordion isn't multi-selectable

    // Usage for slot to provide context to analytics for header and level
    let headerText;
    let headerLevel;
    getSlottedNodes(clickedItem, null).map((node: HTMLSlotElement) => {
      headerText = node?.innerHTML;
      headerLevel = parseInt(node?.tagName?.toLowerCase().split('')[1]);
    });

    if (this.openSingle) {
      getSlottedNodes(this.el, 'va-accordion-item')
        .filter(item => item !== clickedItem)
        .forEach(item => (item as Element).setAttribute('open', 'false'));
    }

    const prevAttr = clickedItem.getAttribute('open') === 'true' ? true : false;

    if (!this.disableAnalytics) {
      const detail = {
        componentName: 'va-accordion',
        action: prevAttr ? 'collapse' : 'expand',
        details: {
          header: headerText || clickedItem.header,
          subheader: clickedItem.subheader,
          level: headerLevel || clickedItem.level,
          sectionHeading: this.sectionHeading,
        },
      };
      this.componentLibraryAnalytics.emit(detail);
    }

    clickedItem.setAttribute('open', !prevAttr);

    if (!this.isScrolledIntoView(clickedItem)) {
      clickedItem.scrollIntoView();
    }

    // Check if all accordions are open or closed due to user clicks
    this.accordionsOpened();
  }

  private accordionsOpened() {
    // Track user clicks on va-accordion-item within an array to compare if all values are true or false
    let accordionItems = [];
    getSlottedNodes(this.el, 'va-accordion-item').forEach(item => {
      accordionItems.push((item as Element).getAttribute('open'));
    });
    const allOpen = currentValue => currentValue === 'true';
    const allClosed = currentValue => currentValue === 'false';
    if (accordionItems.every(allOpen)) {
      this.expanded = true;
    }
    if (accordionItems.every(allClosed)) {
      this.expanded = false;
    }
  }

  // Expand or Collapse All Function for Button Click
  private expandCollapseAll = (expanded: boolean) => {
    this.expanded = expanded;
    getSlottedNodes(this.el, 'va-accordion-item').forEach(item =>
      (item as Element).setAttribute('open', `${expanded}`),
    );
  };

  isScrolledIntoView(el: Element) {
    const elemTop = el?.getBoundingClientRect().top;

    if (!elemTop && elemTop !== 0) {
      return false;
    }

    // Only partially || completely visible elements return true
    return elemTop >= 0 && elemTop <= window.innerHeight;
  }

  /**
   * Whether or not the accordion items will have borders
   */
  @Prop() bordered: boolean;

  /**
   * True if only a single item can be opened at once
   */
  @Prop() openSingle: boolean;

  /**
   * If true, doesn't fire the CustomEvent which can be used for analytics tracking.
   */
  @Prop() disableAnalytics: boolean = false;

  /**
   * Optional accordion section heading text. Only used in analytics event. Default is null.
   */
  @Prop() sectionHeading: string = null;

  render() {
    return (
      <Host>
        {!this.openSingle && (
          <button
            ref={el => (this.expandCollapseBtn = el as HTMLButtonElement)}
            onClick={() => this.expandCollapseAll(!this.expanded)}
            aria-label={
              this.expanded
                ? 'Collapse all accordions'
                : 'Expand all accordions'
            }
          >
            {this.expanded ? 'Collapse all -' : 'Expand all +'}
          </button>
        )}
        <slot />
      </Host>
    );
  }
}

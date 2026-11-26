import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { RouteErrorBoundary, SafePart } from '@/components/route-error';

// expo-router/testing-library registers its own Reanimated mock when imported, which fails on
// Reanimated 4.7 and caches an empty object. Fill that cached object with our working mock before
// the app loads, so every screen sees a usable Reanimated.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockReanimated, mockWorklets } = require('../../jest.mocks');
Object.assign(jest.requireMock('react-native-reanimated') as object, mockReanimated());
Object.assign(jest.requireMock('react-native-worklets') as object, mockWorklets());

/** The app's routes, relative to the project root (where Jest runs). */
const APP = './src/app';

jest.setTimeout(60_000);

/** Presses the last element with this accessibility label (the visible one when screens stack). */
const press = async (label: string | RegExp) => fireEvent.press(screen.getAllByLabelText(label).at(-1)!);
/** Presses the last element showing this text (rows are read by their visible text). */
const pressText = async (text: string) => fireEvent.press(screen.getAllByText(text).at(-1)!);
const type = async (label: string | RegExp, text: string) => fireEvent.changeText(screen.getAllByLabelText(label).at(-1)!, text);

/** Onboarding → Create an account → setup → Home, as a new user does it. */
async function signUp({ second, budgets = 0 }: { second?: string; budgets?: number } = {}) {
  await renderRouter(APP, { initialUrl: '/' });
  await screen.findByLabelText('Skip to the last slide');
  await press('Skip to the last slide');
  await press('Create an account');
  await screen.findByLabelText('First name');
  await type('First name', 'Ada');
  await type('Last name', 'Obi');
  await type('Email', 'ada@example.test');
  await type('Password', 'testpass123');
  await press('Create account');
  await screen.findByText('Your currencies');
  if (second) {
    await press(/^Second currency \(optional\):/);
    await type(/^Search currencies for second/, second);
    await press(new RegExp(`\\(${second}\\), `));
  }
  await press('Continue');
  await screen.findByText('How hands-on do you want to be?');
  if (budgets) await press(/^Track and budgets/);
  await press('Continue');
  await screen.findByText('Your categories');
  if (budgets) {
    for (const option of screen.getAllByLabelText(/^Budget for /).slice(0, budgets)) await fireEvent.press(option);
    const fields = screen.getAllByLabelText(/: a month, in /);
    for (const [i, field] of fields.entries()) await fireEvent.changeText(field, String(90_000 - i * 10_000));
  }
  await press('Finish');
  await screen.findByText('Hello, Ada');
}

/** Opens Add expense from the dock and saves an amount in a category. */
async function addExpense(amount: string, category: string, currency?: string) {
  await press('Add expense');
  await screen.findByText('Save expense');
  if (currency) await press(new RegExp(`^${currency}, `));
  await type(/^Amount in /, amount);
  await press(category);
  await press('Save expense');
  await screen.findByText(new RegExp(`^Saved .* to ${category}$`));
}

describe('sign up → setup → Home', () => {
  it('lands on Home with the greeting, initials and an empty month', async () => {
    await signUp();
    // The avatar is hidden from screen readers (the greeting says the name), so look past that.
    expect(screen.getByText('AO', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText(/^Nothing logged in /)).toBeTruthy();
  });
});

describe('expenses', () => {
  it('adds, edits, deletes and undoes an expense', async () => {
    await signUp();
    await addExpense('2500', 'Food & Groceries');
    expect(screen.getAllByText('₦2,500').length).toBeGreaterThan(0);

    // Edit it from the Expenses tab.
    await press('Expenses');
    await screen.findByLabelText(/^Search .* by note or category$/);
    await screen.findAllByText('Food & Groceries');
    await pressText('Food & Groceries');
    await screen.findByText('Save changes');
    await type(/^Amount in /, '3000');
    await press('Save changes');
    await screen.findByText('Expense updated');
    expect(screen.getAllByText('₦3,000').length).toBeGreaterThan(0);

    // Delete it, then undo.
    await pressText('Food & Groceries');
    await screen.findByText('Delete expense');
    await press('Delete expense');
    await screen.findByText('Deleted ₦3,000');
    expect(screen.queryByText('₦3,000')).toBeNull();
    await press('Undo delete');
    expect((await screen.findAllByText('₦3,000')).length).toBeGreaterThan(0);
  });
});

describe('currencies', () => {
  it('keeps each currency separate and switches with the toggle', async () => {
    await signUp({ second: 'USD' });
    // A glass card for each currency on Home.
    expect(screen.getByLabelText(/^Nigerian naira: ₦0 in /)).toBeTruthy();
    expect(screen.getByLabelText(/^US dollar: \$0 in /)).toBeTruthy();

    await addExpense('2500', 'Food & Groceries');
    await addExpense('15', 'Transportation', 'USD');
    expect(screen.getByLabelText(/^US dollar: \$15 in /)).toBeTruthy();

    // Expenses shows one currency at a time.
    await press('Expenses');
    await screen.findByLabelText(/^Search .* by note or category$/);
    expect(screen.getAllByText('₦2,500').length).toBeGreaterThan(0);
    expect(screen.queryByText('$15')).toBeNull();
    await press('US dollar');
    expect((await screen.findAllByText('$15')).length).toBeGreaterThan(0);
    expect(screen.queryByText('₦2,500')).toBeNull();
  });
});

describe('budgets', () => {
  it('shows a budget set in setup straight away, at ₦0', async () => {
    await signUp({ budgets: 1 });
    expect(screen.getByLabelText(/budget: ₦0 of ₦90,000 spent, 0%, ₦90,000 left$/)).toBeTruthy();
  });
});

describe('never a white screen', () => {
  const Boom = () => {
    throw new Error('boom');
  };

  it('shows the calm error screen with Try again and Go home', async () => {
    const retry = jest.fn(async () => {});
    await render(<RouteErrorBoundary error={new Error('boom')} retry={retry} />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    await press('Try again');
    expect(retry).toHaveBeenCalled();
    expect(screen.getByLabelText('Go home')).toBeTruthy();
  });

  it('keeps the rest of the screen when one part fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await render(
      <>
        <SafePart name="chart" fallback={<Text>Chart unavailable</Text>}>
          <Boom />
        </SafePart>
        <Text>Rest of the screen</Text>
      </>,
    );
    expect(screen.getByText('Chart unavailable')).toBeTruthy();
    expect(screen.getByText('Rest of the screen')).toBeTruthy();
  });
});

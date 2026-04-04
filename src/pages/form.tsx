import type { FC } from "hono/jsx";
import type { User, RelatedToOption, ExpenseType } from "../types";
import { Layout } from "./layout";

export const FormPage: FC<{
  user: User;
  relatedToOptions: ReadonlyArray<RelatedToOption>;
  expenseTypes: ReadonlyArray<ExpenseType>;
}> = ({ user, relatedToOptions, expenseTypes }) => (
  <Layout user={user}>
    <div class="card">
      <div class="card-header">
        <h1>Submit Receipt</h1>
        <p class="text-muted">Upload a receipt to get reimbursed for expenses. If you paid with a Booster VISA card then ignore this, and e-mail the reciept to <a href="mailto:foreningen-boosterkonferansen@bilag.fiken.no">foreningen-boosterkonferansen@bilag.fiken.no</a>.</p>
      </div>

      <form id="receipt-form" data-username={user.name}>
        <div class="form-group">
          <label for="related-to">Related to</label>
          <select id="related-to" name="relatedTo" required>
            <option value="" disabled selected>
              Select…
            </option>
            {relatedToOptions.map((s) => (
              <option value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div class="form-group">
          <label for="expense-type">Expense type</label>
          <select id="expense-type" name="expenseType" required>
            <option value="" disabled selected>
              Select an expense type…
            </option>
            {expenseTypes.map((t) => (
              <option value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="What was the expense for? (optional)"
            maxlength={150}
          />
        </div>

        <div class="form-group">
          <label for="amount">Amount (NOK)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="How much was it? (optional, defaults to receipt)"
          />
        </div>

        <div class="form-group">
          <label for="receipt">Receipt</label>
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block">
          Submit receipt
        </button>
      </form>
    </div>
  </Layout>
);

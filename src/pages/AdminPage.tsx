import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { QUIZ_STEPS } from '@/data/quizSteps'
import { loadLeads, loadOptionStats } from '@/lib/leads'
import { formatMoney } from '@/lib/pricing'
import { useCatalogStore } from '@/store/catalogStore'
import { UNIT_LABELS, type PriceUnit, type Product } from '@/types/catalog'
import type { LeadRecord } from '@/types/quiz'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'packsmart'

function emptyProduct(): Product {
  return {
    id: `p-${Date.now()}`,
    name: '',
    sku: '',
    description: '',
    unit: 'piece',
    retailPrice: 0,
    wholesalePrice: 0,
    wholesaleMinQty: 10,
    discounts: [],
    stock: 0,
    specs: {},
    tags: [],
    popularScore: 50,
    active: true,
  }
}

export function AdminPage() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('packsmart_admin') === '1',
  )
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'products' | 'leads' | 'stats'>('products')
  const [editing, setEditing] = useState<Product | null>(null)

  const products = useCatalogStore((s) => s.products)
  const upsertProduct = useCatalogStore((s) => s.upsertProduct)
  const removeProduct = useCatalogStore((s) => s.removeProduct)

  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!authed) return
    setLeads(loadLeads())
    setStats(loadOptionStats())
  }, [authed, tab])

  const popularProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.active)
      .sort((a, b) => b.popularScore - a.popularScore)
      .slice(0, 8)
  }, [products])

  const optionLabels = useMemo(() => {
    const map = new Map<string, string>()
    for (const step of QUIZ_STEPS) {
      for (const opt of step.options) map.set(opt.id, opt.label)
    }
    return map
  }, [])

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">PackSmart Admin</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Введите пароль для доступа</p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (password === ADMIN_PASSWORD) {
              sessionStorage.setItem('packsmart_admin', '1')
              setAuthed(true)
              setError('')
            } else {
              setError('Неверный пароль')
            }
          }}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-line)] bg-white/80 px-4 py-3"
            placeholder="Пароль"
          />
          {error ? <p className="text-sm text-[var(--color-warn)]">{error}</p> : null}
          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>
        <Link to="/" className="mt-4 text-center text-sm text-[var(--color-muted)]">
          ← К квизу
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">Админ-панель</h1>
          <p className="text-sm text-[var(--color-muted)]">Товары, заявки и статистика PackSmart</p>
        </div>
        <Link to="/" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">
          ← К квизу
        </Link>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ['products', 'Товары'],
            ['leads', 'Заявки'],
            ['stats', 'Статистика'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === id
                ? 'bg-[var(--color-ink)] text-white'
                : 'bg-white/70 text-[var(--color-ink)] border border-[var(--color-line)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'products' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setEditing(emptyProduct())}>Добавить товар</Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-white/70">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-line)] bg-[var(--color-paper-deep)]/60">
                <tr>
                  <th className="px-4 py-3">Название</th>
                  <th className="px-4 py-3">Ед.</th>
                  <th className="px-4 py-3">Розница</th>
                  <th className="px-4 py-3">Опт</th>
                  <th className="px-4 py-3">Склад</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--color-line)]/70">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-[var(--color-muted)]">{p.sku}</div>
                      {p.stock < 100 ? (
                        <div className="mt-1 text-xs font-medium text-[var(--color-warn)]">
                          Мало на складе
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{UNIT_LABELS[p.unit]}</td>
                    <td className="px-4 py-3">{formatMoney(p.retailPrice)}</td>
                    <td className="px-4 py-3">{formatMoney(p.wholesalePrice)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="secondary" className="!px-3 !py-2" onClick={() => setEditing(p)}>
                          Изменить
                        </Button>
                        <Button
                          variant="ghost"
                          className="!px-3 !py-2"
                          onClick={() => {
                            if (confirm(`Удалить «${p.name}»?`)) removeProduct(p.id)
                          }}
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editing ? (
            <ProductEditor
              product={editing}
              onCancel={() => setEditing(null)}
              onSave={(product) => {
                upsertProduct(product)
                setEditing(null)
              }}
            />
          ) : null}
        </div>
      ) : null}

      {tab === 'leads' ? (
        <div className="space-y-3">
          {leads.length === 0 ? (
            <p className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-6 text-[var(--color-muted)]">
              Заявок пока нет. Они появятся после отправки формы на финальном шаге квиза.
            </p>
          ) : (
            leads.map((lead) => (
              <article
                key={lead.id}
                className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{lead.lead.name}</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      {lead.lead.phone}
                      {lead.lead.company ? ` · ${lead.lead.company}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatMoney(lead.total)}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {new Date(lead.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
                {lead.lead.comment ? (
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{lead.lead.comment}</p>
                ) : null}
                <p className="mt-3 text-sm">
                  Позиций в корзине: <strong>{lead.lines.length}</strong>
                </p>
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === 'stats' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
              Популярные товары
            </h2>
            <ul className="mt-4 space-y-2">
              {popularProducts.map((p) => (
                <li key={p.id} className="flex justify-between gap-3 text-sm">
                  <span>{p.name}</span>
                  <span className="font-semibold">{p.popularScore}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-[var(--color-line)] bg-white/70 p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
              Популярные ответы квиза
            </h2>
            <ul className="mt-4 space-y-2">
              {Object.entries(stats).length === 0 ? (
                <li className="text-sm text-[var(--color-muted)]">Пока нет данных</li>
              ) : (
                Object.entries(stats)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 12)
                  .map(([id, count]) => (
                    <li key={id} className="flex justify-between gap-3 text-sm">
                      <span>{optionLabels.get(id) ?? id}</span>
                      <span className="font-semibold">{count}</span>
                    </li>
                  ))
              )}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function ProductEditor({
  product,
  onSave,
  onCancel,
}: {
  product: Product
  onSave: (p: Product) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<Product>(product)
  const [tags, setTags] = useState(product.tags.join(', '))
  const [discounts, setDiscounts] = useState(
    product.discounts.map((d) => `${d.minQty}:${d.percent}`).join(', '),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--color-paper)] p-5 shadow-xl">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
          {product.name ? 'Редактирование товара' : 'Новый товар'}
        </h3>
        <div className="mt-4 space-y-3">
          <Field
            label="Название"
            value={draft.name}
            onChange={(v) => setDraft({ ...draft, name: v })}
          />
          <Field
            label="SKU"
            value={draft.sku ?? ''}
            onChange={(v) => setDraft({ ...draft, sku: v })}
          />
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Единица</span>
            <select
              value={draft.unit}
              onChange={(e) => setDraft({ ...draft, unit: e.target.value as PriceUnit })}
              className="w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2"
            >
              {Object.entries(UNIT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Розница"
              type="number"
              value={String(draft.retailPrice)}
              onChange={(v) => setDraft({ ...draft, retailPrice: Number(v) || 0 })}
            />
            <Field
              label="Опт"
              type="number"
              value={String(draft.wholesalePrice)}
              onChange={(v) => setDraft({ ...draft, wholesalePrice: Number(v) || 0 })}
            />
            <Field
              label="Порог опта"
              type="number"
              value={String(draft.wholesaleMinQty)}
              onChange={(v) => setDraft({ ...draft, wholesaleMinQty: Number(v) || 0 })}
            />
            <Field
              label="Склад"
              type="number"
              value={String(draft.stock)}
              onChange={(v) => setDraft({ ...draft, stock: Number(v) || 0 })}
            />
          </div>
          <Field
            label="Теги (через запятую)"
            value={tags}
            onChange={setTags}
          />
          <Field
            label="Скидки qty:percent (через запятую)"
            value={discounts}
            onChange={setDiscounts}
            placeholder="100:5, 300:10"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              if (!draft.name.trim()) return
              onSave({
                ...draft,
                tags: tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
                discounts: discounts
                  .split(',')
                  .map((chunk) => chunk.trim())
                  .filter(Boolean)
                  .map((chunk) => {
                    const [minQty, percent] = chunk.split(':').map(Number)
                    return { minQty: minQty || 0, percent: percent || 0 }
                  }),
              })
            }}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2"
      />
    </label>
  )
}

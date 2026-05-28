import { useAdminCustomersViewModel } from './useAdminCustomersViewModel'
import type { Customer } from '../../../services/api'
import './customers.css'

export default function AdminCustomersPage() {
  const { customers, selected, onSelectCustomer, meta, totalPages, onPrevPage, onNextPage } =
    useAdminCustomersViewModel()

  return (
    <div className="customersPage">
      <aside className="master">
        <div className="masterHeader">
          <h1 className="masterTitle">{"Clientes"}</h1>
          <span className="masterCount">{meta.total} registros</span>
        </div>

        {meta.error && <p className="masterError">{meta.error}</p>}

        {meta.loading ? (
          <div className="masterLoading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeletonRow" />
            ))}
          </div>
        ) : (
          <ul className="masterList">
            {customers.map((c) => (
              <CustomerRow
                key={c.id}
                customer={c}
                selected={selected?.id === c.id}
                onClick={() => onSelectCustomer(c)}
              />
            ))}
            {Array.from({ length: 10 - customers.length }).map((_, i) => (
              <li key={`empty-${i}`} className="masterRow masterRowEmpty" />
            ))}
          </ul>
        )}

        <div className="masterPagination">
          <button
            className="paginationBtn"
            onClick={onPrevPage}
            disabled={meta.page <= 1}
          >
            {"← Anterior"}
          </button>
          <span className="paginationInfo">
            {meta.page} / {totalPages || 1}
          </span>
          <button
            className="paginationBtn"
            onClick={onNextPage}
            disabled={meta.page >= totalPages}
          >
            {"Próximo →"}
          </button>
        </div>
      </aside>

      <section className="detail">
        {selected ? (
          <CustomerDetail customer={selected} />
        ) : (
          <div className="detailEmpty">
            <span className="detailEmptyIcon">{"☰"}</span>
            <p>{"Selecione um cliente para ver os detalhes"}</p>
          </div>
        )}
      </section>
    </div>
  )
}

function CustomerRow({
  customer,
  selected,
  onClick,
}: {
  customer: Customer
  selected: boolean
  onClick: () => void
}) {
  return (
    <li className={`masterRow ${selected ? 'masterRowSelected' : ''}`} onClick={onClick}>
      <span
        className="masterRowDot"
        style={{ background: customer.color.hex }}
      />
      <div className="masterRowInfo">
        <span className="masterRowName">{customer.fullName}</span>
        <span className="masterRowEmail">{customer.email}</span>
      </div>
      <span className="masterRowCpf">
        {customer.cpfStart}.***.**-{customer.cpfEnd}
      </span>
    </li>
  )
}

function CustomerDetail({ customer }: { customer: Customer }) {
  const date = new Date(customer.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="detailContent">
      <div className="detailColorBar" style={{ background: customer.color.hex }} />

      <div className="detailBody">
        <p className="detailOverline">{"Cliente"}</p>
        <h2 className="detailName">{customer.fullName}</h2>

        <div className="detailFields">
          <div className="detailField">
            <span className="detailFieldLabel">{"CPF"}</span>
            <span className="detailFieldValue">
              {customer.cpfStart}.***.***-{customer.cpfEnd}
            </span>
          </div>

          <div className="detailField">
            <span className="detailFieldLabel">{"E-mail"}</span>
            <span className="detailFieldValue">{customer.email}</span>
          </div>

          <div className="detailField">
            <span className="detailFieldLabel">{"Cor favorita"}</span>
            <span className="detailFieldValue detailFieldValueColor">
              <span
                className="detailColorDot"
                style={{ background: customer.color.hex }}
              />
              {customer.color.name}
            </span>
          </div>

          {customer.notes && (
            <div className="detailField detailFieldFull">
              <span className="detailFieldLabel">{"Observações"}</span>
              <span className="detailFieldValue">{customer.notes}</span>
            </div>
          )}

          <div className="detailField">
            <span className="detailFieldLabel">{"Cadastrado em"}</span>
            <span className="detailFieldValue">{date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

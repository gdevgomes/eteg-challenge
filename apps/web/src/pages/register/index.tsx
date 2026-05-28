import { Controller } from 'react-hook-form';
import { useRegisterViewModel } from './useRegisterViewModel';
import { Select } from './Select';
import './register.css';

export default function RegisterPage() {
  const vm = useRegisterViewModel();

  if (vm.success) {
    return (
      <div className="registerPage">
        <div className="registerSuccess">
          <span className="successIcon">{"✓"}</span>
          <h2 className="successTitle">
            {vm.mode === 'edit' ? 'Dados atualizados!' : 'Cadastro realizado!'}
          </h2>
          <p className="successDesc">
            {vm.mode === 'edit'
              ? 'Suas informações foram salvas com sucesso.'
              : 'Seu cadastro foi concluído com sucesso.'}
          </p>
          <button className="btnPrimary successBtn" onClick={vm.onReset}>
            {"Novo cadastro"}
          </button>
        </div>
      </div>
    );
  }

  const {
    register,
    formState: { errors, isSubmitting },
    watch,
  } = vm.form;
  const fieldsVisible = vm.cpfVerified && !vm.lookupLoading;
  const cpfValue = watch('cpf');

  return (
    <div className="registerPage">
      <div className="registerPanelLeft">
        <h1 className="registerPanelLeftTitle">{"Cadastro de clientes"}</h1>
        <p className="registerPanelLeftDesc">
          {"Preencha o formulário ao lado para realizar seu cadastro ou atualizar seus dados. Informe seu CPF para verificarmos se você já possui um registro."}
        </p>
      </div>

      <div
        className={`registerPanelRight ${fieldsVisible ? 'register-panel-right--expanded' : ''}`}
      >
        <form className="registerForm" onSubmit={vm.onSubmit} noValidate>
          <div className={`formIntro ${fieldsVisible ? 'formIntroUp' : ''}`}>
            <h2 className="registerFormHeaderTitle">
              {!vm.cpfVerified
                ? 'Primeiro insira o seu CPF'
                : vm.mode === 'edit'
                  ? 'Atualizar dados'
                  : 'Preencha seus dados'}
            </h2>

            <div className="field">
              <label className="fieldLabel" htmlFor="cpf">
                {"CPF"}
                {vm.lookupLoading && (
                  <span className="fieldHint">{" verificando…"}</span>
                )}
              </label>
              <input
                id="cpf"
                ref={vm.cpfInputRef}
                className={`fieldInput ${errors.cpf ? 'fieldInputError' : ''}`}
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpfValue}
                onChange={(e) => vm.onCpfChange(e.target.value)}
              />
              {errors.cpf && (
                <span className="fieldError">{errors.cpf.message}</span>
              )}
            </div>
          </div>

          {fieldsVisible && (
            <div className="fieldsReveal">
              <div className="field">
                <label className="fieldLabel" htmlFor="fullName">
                  {"Nome completo"}
                </label>
                <input
                  id="fullName"
                  className={`fieldInput ${errors.fullName ? 'fieldInputError' : ''}`}
                  type="text"
                  autoComplete="name"
                  onFocus={(e) => {
                    if (vm.maskedInfo && e.target.value === vm.maskedInfo.name)
                      vm.form.setValue('fullName', '');
                  }}
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <span className="fieldError">{errors.fullName.message}</span>
                )}
              </div>

              <div className="field">
                <label className="fieldLabel" htmlFor="email">
                  {"E-mail"}
                </label>
                <input
                  id="email"
                  className={`fieldInput ${errors.email ? 'fieldInputError' : ''}`}
                  type="email"
                  autoComplete="email"
                  onFocus={(e) => {
                    if (vm.maskedInfo && e.target.value === vm.maskedInfo.email)
                      vm.form.setValue('email', '');
                  }}
                  {...register('email')}
                />
                {errors.email && (
                  <span className="fieldError">{errors.email.message}</span>
                )}
              </div>

              <div className="field">
                <label className="fieldLabel">{"Cor favorita"}</label>
                <Controller
                  name="colorId"
                  control={vm.form.control}
                  render={({ field }) => (
                    <Select
                      colors={vm.colors}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      error={!!errors.colorId}
                    />
                  )}
                />
                {errors.colorId && (
                  <span className="fieldError">{errors.colorId.message}</span>
                )}
              </div>

              <div className="field">
                <label className="fieldLabel" htmlFor="notes">
                  {"Observações"} <span className="fieldOptional">{"(opcional)"}</span>
                </label>
                <textarea
                  id="notes"
                  className="fieldInput fieldTextarea"
                  rows={3}
                  {...register('notes')}
                />
              </div>

              {errors.root && (
                <p className="formRootError">{errors.root.message}</p>
              )}
            </div>
          )}

          <button
            className="btnPrimary"
            type="submit"
            disabled={isSubmitting || !fieldsVisible}
          >
            {isSubmitting
              ? 'Salvando…'
              : vm.mode === 'edit'
                ? 'Salvar alterações'
                : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

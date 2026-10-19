import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { site } from '@/config/site'

/**
 * Política de privacidade — MODELO-BASE. Revise com o jurídico/DPO da empresa
 * antes de publicar e complete os campos de contato do controlador.
 */
export function PrivacyPage() {
  const contato = site.contact.email || '[e-mail do encarregado de dados — a definir]'
  return (
    <>
      <Header base="/" />
      <main id="conteudo" className="pb-28 pt-40">
        <article className="container-site max-w-3xl">
          <p className="eyebrow mb-6">Documento</p>
          <h1 className="display-2">Política de privacidade</h1>
          <p className="mt-6 border-l-2 border-metal/60 pl-4 text-sm text-steel-400">
            Modelo inicial — este texto deve ser revisado e aprovado pela {site.name} antes da publicação definitiva.
          </p>
          <div className="mt-12 space-y-10 leading-relaxed text-steel-300 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-white">
            <section>
              <h2>1. Quais dados coletamos</h2>
              <p>
                Coletamos apenas os dados informados voluntariamente no formulário de contato: nome, empresa (opcional), e-mail, telefone,
                tipo de serviço desejado e descrição do projeto.
              </p>
            </section>
            <section>
              <h2>2. Para que usamos</h2>
              <p>Os dados são usados exclusivamente para responder à sua solicitação, elaborar propostas e manter o contato comercial relacionado a ela.</p>
            </section>
            <section>
              <h2>3. Compartilhamento</h2>
              <p>
                Não vendemos nem cedemos seus dados. Eles podem ser processados por fornecedores de tecnologia necessários ao funcionamento do
                site (hospedagem e serviço de envio de formulários), que atuam conforme nossas instruções.
              </p>
            </section>
            <section>
              <h2>4. Armazenamento e segurança</h2>
              <p>Mantemos os dados pelo tempo necessário para atender à finalidade informada e adotamos medidas razoáveis para protegê-los.</p>
            </section>
            <section>
              <h2>5. Seus direitos (LGPD)</h2>
              <p>
                Você pode solicitar acesso, correção, anonimização ou exclusão dos seus dados, além de informações sobre o tratamento, nos termos
                da Lei nº 13.709/2018 (LGPD).
              </p>
            </section>
            <section>
              <h2>6. Cookies</h2>
              <p>Este site não utiliza cookies de rastreamento ou publicidade. Caso ferramentas de análise sejam adicionadas, esta política será atualizada.</p>
            </section>
            <section>
              <h2>7. Contato</h2>
              <p>Para exercer seus direitos ou tirar dúvidas, entre em contato: {contato}.</p>
              {site.contact.address && <p className="mt-3">Endereço: {site.contact.address}.</p>}
            </section>
          </div>
          <a href="/" className="mt-16 inline-block text-sm text-white underline decoration-white/25 underline-offset-[6px] hover:decoration-metal-light">
            ← Voltar para o início
          </a>
        </article>
      </main>
      <Footer base="/" />
    </>
  )
}

# Convite de casamento — Pedro & Jordana — versão final v2

Projeto estático (HTML + CSS + JavaScript), preparado para Live Server e GitHub Pages.

## Novidade desta versão: dois tipos de convite

Cada convidado pode receber:

1. **Civil + Celebração**
   - mostra cartório;
   - mostra horário e mapa do cartório;
   - mostra celebração;
   - contador termina no início do casamento civil;
   - arquivo de agenda inclui civil + celebração + costelão.

2. **Somente Celebração**
   - não mostra horário, mapa ou rota do cartório;
   - explica de forma elegante que o casamento civil será reservado devido à capacidade do cartório;
   - destaca a celebração como momento principal;
   - contador termina no início da celebração;
   - arquivo de agenda inclui apenas celebração + costelão;
   - RSVP no WhatsApp identifica que aquele convite é "Somente celebração".

## 1. Antes de publicar

Edite `config.js`:

- `whatsappNumber`: número que receberá o RSVP;
- data e horários;
- endereços;
- `heroImage`.

Coloque a foto em:

`assets/casal.jpg`

## 2. Testar com Live Server

Abra a pasta do projeto no VS Code e inicie o Live Server no `index.html`.

Depois abra:

`gerar-links.html`

na MESMA pasta servida pelo Live Server.

O gerador detecta automaticamente a pasta atual.

## 3. Gerar convidados

No `gerar-links.html`:

1. cole um convidado/família por linha;
2. escolha o tipo padrão;
3. clique em **Gerar links**;
4. na tabela, altere individualmente quem terá:
   - Civil + Celebração;
   - Somente Celebração.
5. clique em **Testar** para conferir;
6. baixe o CSV final.

Também é possível definir o tipo diretamente no texto:

`Simone, Luciano e Débora | completo`

`Mariana Silva | celebracao`

## 4. Formato do link

O link usa:

`?i=...`

Dentro desse parâmetro ficam codificados:

- nome;
- código individual;
- tipo de convite.

A classificação não aparece de forma legível na URL.

## 5. RSVP

O convidado:

1. abre o link individual;
2. vê o próprio nome;
3. recebe apenas as informações correspondentes ao tipo de convite;
4. escolhe Sim ou Não;
5. toca em "Enviar resposta pelo WhatsApp";
6. o WhatsApp abre com a mensagem pronta;
7. toca em Enviar.

A mensagem contém:

- nome do convite;
- resposta;
- tipo do convite;
- código individual.

## 6. GitHub Pages

Suba os arquivos deste projeto diretamente na raiz do repositório.

Depois:

1. Settings;
2. Pages;
3. Build and deployment;
4. Deploy from a branch;
5. `main`;
6. `/(root)`;
7. Save.

Depois de publicado, abra:

`https://SEU-USUARIO.github.io/convite-casamento/gerar-links.html`

## 7. Privacidade

O GitHub Pages é público.

O projeto possui `robots.txt` e `noindex` para pedir aos mecanismos de busca que não indexem o convite, mas isso não é proteção por senha.

Não envie o CSV de convidados ao GitHub.

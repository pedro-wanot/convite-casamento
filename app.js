(() => {
  "use strict";

  const CONFIG = window.WEDDING_CONFIG || {};
  const EVENT = CONFIG.event || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------
  function normalizeGuestName(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/[<>]/g, "")
      .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  function normalizeInviteCode(value) {
    return String(value || "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 80);
  }

  function normalizeInviteType(value) {
    const normalized = String(value || "").toLowerCase().trim();
    return ["celebracao", "celebração", "celebration", "recepcao", "recepção"].includes(normalized)
      ? "celebracao"
      : "completo";
  }

  function decodeBase64Url(value) {
    const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function readInvitation() {
    const params = new URLSearchParams(location.search);

    // Formato atual: ?i=<payload-base64url>
    const payload = params.get("i");
    if (payload) {
      try {
        const decoded = JSON.parse(decodeBase64Url(payload));
        const guest = normalizeGuestName(decoded?.n);
        const inviteCode = normalizeInviteCode(decoded?.c);
        const inviteType = normalizeInviteType(decoded?.t);

        if (guest) return { guest, inviteCode, inviteType };
      } catch (error) {
        console.warn("Link de convite inválido.", error);
      }
    }

    // Compatibilidade com links antigos.
    return {
      guest: normalizeGuestName(params.get("convidado") || params.get("nome")),
      inviteCode: normalizeInviteCode(
        params.get("convite") || params.get("token") || params.get("id")
      ),
      inviteType: normalizeInviteType(params.get("tipo"))
    };
  }

  function mapUrl(address) {
    return address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
      : "#";
  }

  function setText(selector, text) {
    const el = $(selector);
    if (el && text !== undefined && text !== null) el.textContent = text;
  }

  function setHref(selector, href) {
    const el = $(selector);
    if (el && href && href !== "#") el.href = href;
  }

  // ---------------------------------------------------------------------------
  // 1) Dados do evento — config.js é a única fonte de verdade
  // ---------------------------------------------------------------------------
  setText("#heroDate", EVENT.dateLabel);
  setText("#detailDate", EVENT.dateLabel);
  setText("#civilTime", EVENT.civil?.timeLabel);
  setText("#celebrationTime", EVENT.celebration?.timeLabel);
  setText("#farewellTime", EVENT.farewell?.timeLabel);

  setHref("#civilMapLink", mapUrl(EVENT.civil?.address));
  setHref("#civilRouteButton", mapUrl(EVENT.civil?.address));
  setHref("#celebrationMapLink", mapUrl(EVENT.celebration?.address));
  setHref("#celebrationRouteButton", mapUrl(EVENT.celebration?.address));

  if (CONFIG.heroImage) {
    document.documentElement.style.setProperty(
      "--hero-image",
      `url("${String(CONFIG.heroImage).replace(/"/g, '\\"')}")`
    );
  }

  // ---------------------------------------------------------------------------
  // 2) Convite individual + tipo de acesso
  // ---------------------------------------------------------------------------
  const { guest, inviteCode, inviteType } = readInvitation();
  const isCelebrationOnly = inviteType === "celebracao";
  document.body.dataset.inviteType = inviteType;

  const guestTokenInput = $("#guestToken");
  const guestNameInput = $("#guestNameInput");
  const guestInviteTypeInput = $("#guestInviteType");
  const guestDisplay = $("#guestDisplay");
  const guestIntro = $("#guestIntro");
  const guestEyebrow = $("#guestEyebrow");
  const rsvpForm = $("#rsvpForm");
  const rsvpButton = rsvpForm?.querySelector('button[type="submit"]');
  const attendanceInputs = $$('#rsvpForm input[name="attendance"]');

  if (guestTokenInput) guestTokenInput.value = inviteCode;
  if (guestNameInput) guestNameInput.value = guest;
  if (guestInviteTypeInput) guestInviteTypeInput.value = inviteType;

  // Mostra/esconde blocos específicos sem duplicar o site.
  $$("[data-civil-only]").forEach(el => {
    el.hidden = isCelebrationOnly;
  });

  $$("[data-celebration-only]").forEach(el => {
    el.hidden = !isCelebrationOnly;
  });

  if (isCelebrationOnly) {
    setText("#welcomeEyebrow", "Esperamos você para celebrar conosco");
    setText("#welcomeTitle", "Um momento especial que queremos viver ao seu lado.");
    setText(
      "#welcomeText",
      "Nossa celebração foi preparada com muito carinho para reunirmos pessoas especiais e comemorarmos juntos essa nova etapa das nossas vidas."
    );

    setText("#detailsEyebrow", "Nossa celebração");
    setText("#detailsTitle", "Esperamos você para celebrar conosco");
    setText(
      "#detailsIntro",
      "A partir das 16h, teremos uma breve cerimônia, seguida de coquetel, recepção e muita comemoração."
    );

    setText("#celebrationTimeLabel", "Horário da Celebração");
    setText(
      "#hotelHelpText",
      "Sugestão de hotel para quem vem de longe e deseja ficar próximo à região da celebração."
    );
    setText(
      "#transportHelpText",
      "A celebração é de fácil acesso de carro. Utilize o botão de rota para abrir o trajeto no mapa."
    );
    setText(
      "#celebrationHelpText",
      "Esperamos você a partir das 16h para uma breve cerimônia, seguida de coquetel e recepção."
    );
    setText(
      "#rsvpIntro",
      "Este convite foi preparado especialmente para você participar da nossa celebração. Escolha Sim ou Não e envie sua resposta pelo WhatsApp."
    );
  } else {
    setText("#welcomeEyebrow", "Sejam muito bem-vindos");
    setText("#welcomeTitle", "Um dia simples, íntimo e muito especial.");
    setText(
      "#welcomeText",
      "Preparamos este espaço com carinho para compartilhar cada detalhe e facilitar a viagem de quem estará conosco."
    );

    setText("#detailsEyebrow", "Quando & onde");
    setText("#detailsTitle", "Casamento civil & celebração");
    setText(
      "#detailsIntro",
      "Confira os horários e locais preparados para este dia."
    );
  }

  if (guest) {
    document.title = `${guest} — Convite de ${CONFIG.couple?.names || "Pedro & Jordana"}`;

    if (guestIntro) {
      guestIntro.textContent = `${guest}, este convite é para ${guest.includes(",") || guest.includes(" e ") ? "vocês" : "você"}`;
    }

    if (guestEyebrow) {
      guestEyebrow.textContent = isCelebrationOnly
        ? `${guest}, queremos celebrar com ${guest.includes(",") || guest.includes(" e ") ? "vocês" : "você"}`
        : `${guest}, temos um convite especial`;
    }

    if (guestDisplay) {
      guestDisplay.textContent = isCelebrationOnly
        ? `Convite para a celebração preparado especialmente para ${guest}.`
        : `Convite preparado especialmente para ${guest}.`;
    }

    if (rsvpButton) rsvpButton.disabled = true;
  } else {
    if (guestDisplay) {
      guestDisplay.textContent = "Abra o link individual que recebeu para confirmar sua presença.";
    }
    if (rsvpButton) rsvpButton.disabled = true;
    attendanceInputs.forEach(input => input.disabled = true);
  }

  attendanceInputs.forEach(input => {
    input.addEventListener("change", () => {
      if (rsvpButton && guest) rsvpButton.disabled = false;
      const status = $("#formStatus");
      if (status) status.textContent = "";
    });
  });

  // ---------------------------------------------------------------------------
  // 3) Abertura do envelope
  // ---------------------------------------------------------------------------
  const intro = $("#intro");
  const envelope = $("#envelope");

  $("#openInvite")?.addEventListener("click", () => {
    envelope?.classList.add("open");
    setTimeout(() => intro?.classList.add("opened"), 8000);
  });

  // ---------------------------------------------------------------------------
  // 4) Menu e topo
  // ---------------------------------------------------------------------------
  const body = document.body;
  const menu = $("#mobileMenu");
  const backdrop = $("#backdrop");
  const menuBtn = $("#menuBtn");

  function setMenu(open) {
    menu?.classList.toggle("open", open);
    backdrop?.classList.toggle("open", open);
    body.classList.toggle("menu-open", open);
    menu?.setAttribute("aria-hidden", String(!open));
    menuBtn?.setAttribute("aria-expanded", String(open));
  }

  menuBtn?.addEventListener("click", () => setMenu(true));
  $("#menuClose")?.addEventListener("click", () => setMenu(false));
  backdrop?.addEventListener("click", () => setMenu(false));

  $$("a", menu || document.createElement("div")).forEach(a => {
    a.addEventListener("click", () => setMenu(false));
  });

  const topbar = $("#topbar");
  addEventListener("scroll", () => {
    topbar?.classList.toggle("scrolled", scrollY > 30);
  }, { passive: true });

  // ---------------------------------------------------------------------------
  // 5) Animações nativas
  // ---------------------------------------------------------------------------
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    $$(".reveal").forEach(el => revealObserver.observe(el));
  } else {
    $$(".reveal").forEach(el => el.classList.add("visible"));
  }

  // ---------------------------------------------------------------------------
  // 6) Contagem regressiva
  // Convite completo conta até o civil; convite celebração conta até a celebração.
  // ---------------------------------------------------------------------------
  const countdownSource = isCelebrationOnly ? EVENT.celebration?.start : EVENT.civil?.start;
  const countdownTarget = new Date(countdownSource || EVENT.celebration?.start || "2026-09-18T16:00:00-03:00");

  const countdownEls = {
    days: $("#days"),
    hours: $("#hours"),
    minutes: $("#minutes"),
    seconds: $("#seconds")
  };

  function updateCountdown() {
    let distance = countdownTarget.getTime() - Date.now();
    if (!Number.isFinite(distance) || distance < 0) distance = 0;

    const values = {
      days: Math.floor(distance / 86400000),
      hours: Math.floor((distance % 86400000) / 3600000),
      minutes: Math.floor((distance % 3600000) / 60000),
      seconds: Math.floor((distance % 60000) / 1000)
    };

    Object.entries(values).forEach(([key, value]) => {
      if (countdownEls[key]) {
        countdownEls[key].textContent = String(value).padStart(2, "0");
      }
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---------------------------------------------------------------------------
  // 7) RSVP -> WhatsApp
  // ---------------------------------------------------------------------------
  function isPlaceholderWhatsApp(number) {
    return !/^\d{12,15}$/.test(number || "") || /999999/.test(number || "");
  }

  function inviteTypeLabel() {
    return isCelebrationOnly ? "Somente celebração" : "Civil + celebração";
  }

  function buildWhatsAppMessage(attendance) {
    const yes = attendance === "Sim";

    return [
      `Olá! RSVP do convite de ${guest}.`,
      `Resposta: ${yes ? "✅ SIM — presença confirmada" : "❌ NÃO — não será possível comparecer"}.`,
      `Convite: ${inviteTypeLabel()}.`,
      inviteCode ? `Código do convite: ${inviteCode}` : ""
    ].filter(Boolean).join("\n");
  }

  rsvpForm?.addEventListener("submit", event => {
    event.preventDefault();
    const status = $("#formStatus");

    if (!guest) {
      if (status) status.textContent = "Este link não possui um convidado identificado.";
      return;
    }

    const formData = new FormData(rsvpForm);
    const attendance = formData.get("attendance");

    if (!attendance) {
      if (status) status.textContent = "Escolha Sim ou Não antes de continuar.";
      return;
    }

    const whatsappNumber = String(CONFIG.whatsappNumber || "").replace(/\D/g, "");

    if (isPlaceholderWhatsApp(whatsappNumber)) {
      if (status) {
        status.textContent = "Configure seu número real no arquivo config.js antes de publicar.";
      }
      return;
    }

    const record = {
      guest,
      inviteCode,
      inviteType,
      attendance,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        `rsvp-pedro-jordana-${inviteCode || guest.toLowerCase().replace(/\s+/g, "-")}`,
        JSON.stringify(record)
      );
    } catch {}

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(attendance))}`;

    if (status) {
      status.textContent = attendance === "Sim"
        ? `Perfeito, ${guest}. Abrindo o WhatsApp para enviar sua confirmação.`
        : `Obrigado por nos avisar, ${guest}. Abrindo o WhatsApp para enviar sua resposta.`;
    }

    if (matchMedia("(max-width: 700px)").matches) {
      location.href = whatsappUrl;
      return;
    }

    const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!opened) location.href = whatsappUrl;
  });

  // ---------------------------------------------------------------------------
  // 8) Compartilhamento
  // Se o convite é individual, compartilha o próprio link individual.
  // ---------------------------------------------------------------------------
  $("#shareBtn")?.addEventListener("click", async () => {
    const shareUrl = guest ? location.href : new URL("./", location.href).href;

    const shareData = {
      title: `${CONFIG.couple?.names || "Pedro & Jordana"} — Convite`,
      text: `${CONFIG.couple?.names || "Pedro & Jordana"} — convite de casamento.`,
      url: shareUrl
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link do convite copiado.");
    } catch {
      prompt("Copie o link:", shareUrl);
    }
  });

  // ---------------------------------------------------------------------------
  // 9) Adicionar à agenda
  // Convite "somente celebração" NÃO inclui o cartório.
  // ---------------------------------------------------------------------------
  function fmtICS(date) {
    return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function escapeICS(value = "") {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function eventToICS(item, description) {
    if (!item?.start || !item?.end) return [];

    const fallbackUid = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return [
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID?.() || fallbackUid}@pedroejordana`,
      `DTSTAMP:${fmtICS(new Date())}`,
      `DTSTART:${fmtICS(item.start)}`,
      `DTEND:${fmtICS(item.end)}`,
      `SUMMARY:${escapeICS(item.title)}`,
      `LOCATION:${escapeICS(item.location)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      "END:VEVENT"
    ];
  }

  $("#calendarBtn")?.addEventListener("click", () => {
    const calendarEvents = [];

    if (!isCelebrationOnly) {
      calendarEvents.push(
        ...eventToICS(EVENT.civil, "Casamento civil de Pedro & Jordana.")
      );
    }

    calendarEvents.push(
      ...eventToICS(
        EVENT.celebration,
        "Celebração, breve cerimônia, coquetel e recepção de Pedro & Jordana."
      ),
      ...eventToICS(
        EVENT.farewell,
        "Costelão de despedida. O local será informado durante a celebração."
      )
    );

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "PRODID:-//Pedro e Jordana//Convite//PT-BR",
      ...calendarEvents,
      "END:VCALENDAR"
    ];

    const blob = new Blob(
      [lines.join("\r\n")],
      { type: "text/calendar;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: isCelebrationOnly
        ? "celebracao-pedro-jordana.ics"
        : "casamento-pedro-jordana.ics"
    });

    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // ---------------------------------------------------------------------------
  // 10) Traje
  // ---------------------------------------------------------------------------
  const dialog = $("#dressDialog");

  $("#dressBtn")?.addEventListener("click", () => dialog?.showModal());
  $("#dressClose")?.addEventListener("click", () => dialog?.close());

  dialog?.addEventListener("click", event => {
    const r = dialog.getBoundingClientRect();
    const outside =
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom;

    if (outside) dialog.close();
  });

  // ---------------------------------------------------------------------------
  // 11) Parallax / tilt
  // ---------------------------------------------------------------------------
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer:fine)").matches;
  const heroMedia = $(".hero__media");

  if (finePointer && !reduceMotion && heroMedia) {
    addEventListener("scroll", () => {
      const y = Math.min(scrollY * 0.045, 28);
      heroMedia.style.transform =
        `scale(1.07) translate3d(0, ${y}px, 0)`;
    }, { passive: true });

    $$(".tilt").forEach(card => {
      card.addEventListener("pointermove", event => {
        const r = card.getBoundingClientRect();
        const x = (event.clientX - r.left) / r.width - 0.5;
        const y = (event.clientY - r.top) / r.height - 0.5;

        card.style.transform =
          `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 4}deg)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 12) Partículas
  // ---------------------------------------------------------------------------
  const canvas = $("#sparkles");
  const ctx = canvas?.getContext?.("2d");
  let particles = [];
  let ratio = Math.min(devicePixelRatio || 1, 2);

  function resizeCanvas() {
    if (!canvas || !ctx) return;

    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(46, Math.max(18, Math.floor(innerWidth / 28)));

    particles = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: 0.5 + Math.random() * 1.5,
      a: 0.10 + Math.random() * 0.35,
      vy: 0.08 + Math.random() * 0.18,
      drift: Math.random() * Math.PI * 2
    }));
  }

  function sparkleLoop(t = 0) {
    if (!ctx) return;

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (const p of particles) {
      p.y -= p.vy;
      p.x += Math.sin(t * 0.0004 + p.drift) * 0.05;

      if (p.y < -5) {
        p.y = innerHeight + 5;
        p.x = Math.random() * innerWidth;
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(218,180,112,${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(sparkleLoop);
  }

  if (canvas && ctx) {
    resizeCanvas();
    addEventListener("resize", resizeCanvas);

    if (!reduceMotion) {
      sparkleLoop();
    }
  }
})();

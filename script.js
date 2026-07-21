"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const KAKAO_URL = "https://open.kakao.com/o/s9MsLsqi";

  const state = {
    housingType: "",
    housingSize: "",
    wallpaper: "",
    condition: {
      condensation: "",
      mold: "",
      furniture: ""
    },
    additional: [],
    additionalDirect: "",
    addressType: "",
    district: "",
    neighborhood: "",
    newAddress: ""
  };

  const housingSizes = {
    원룸: ["6평 이하", "10평 이하", "15평 이하"],
    빌라: ["15평 이하", "20평 이하", "25평 이하", "30평 이하", "35평 이하", "40평 이하", "40평 초과"],
    아파트: ["15평 이하", "20평 이하", "25평 이하", "30평 이하", "35평 이하", "40평 이하", "40평 초과"],
    주택: ["20평 이하", "30평 이하", "40평 이하", "50평 이하", "60평 이하", "60평 초과"]
  };

  const neighborhoods = {
    강북구: ["미아동", "번동", "수유동", "우이동"],
    노원구: ["공릉동", "상계동", "월계동", "중계동", "하계동"],
    도봉구: ["도봉동", "방학동", "쌍문동", "창동"],
    성북구: [
      "길음동", "돈암동", "동선동", "보문동", "삼선동", "석관동",
      "성북동", "안암동", "월곡동", "장위동", "정릉동", "종암동"
    ]
  };

  const sections = [
    ["housing-header", "housing-content"],
    ["wallpaper-header", "wallpaper-content"],
    ["condition-header", "condition-content"],
    ["additional-header", "additional-content"],
    ["location-header", "location-content"]
  ];

  function openSection(headerId, contentId) {
    sections.forEach(([hId, cId]) => {
      const header = document.getElementById(hId);
      const content = document.getElementById(cId);
      const shouldOpen = hId === headerId;

      header.setAttribute("aria-expanded", String(shouldOpen));
      content.hidden = !shouldOpen;
    });
  }

  function closeSection(headerId, contentId) {
    document.getElementById(headerId).setAttribute("aria-expanded", "false");
    document.getElementById(contentId).hidden = true;
  }

  sections.forEach(([headerId, contentId]) => {
    const header = document.getElementById(headerId);
    const content = document.getElementById(contentId);

    header.addEventListener("click", () => {
      const isOpen = header.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeSection(headerId, contentId);
      } else {
        openSection(headerId, contentId);
      }
    });
  });

  function selectSingle(buttons, selectedButton) {
    buttons.forEach((button) => {
      const selected = button === selectedButton;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function resetHousingSubOptions() {
    document.getElementById("housing-size-group").hidden = true;
    document.getElementById("housing-area-input-group").hidden = true;
    document.getElementById("housing-size-options").innerHTML = "";
    document.getElementById("housing-area-input").value = "";
  }

  function finishHousing() {
    if (!state.housingType || !state.housingSize) return;
    document.getElementById("housing-summary").textContent =
      `${state.housingType} · ${state.housingSize}`;
    closeSection("housing-header", "housing-content");
  }

  const housingButtons = [...document.querySelectorAll("[data-housing]")];

  housingButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      selectSingle(housingButtons, button);
      state.housingType = button.dataset.housing;
      state.housingSize = "";
      resetHousingSubOptions();

      if (state.housingType === "상가" || state.housingType === "사무실") {
        document.getElementById("housing-area-input-group").hidden = false;
        document.getElementById("housing-area-input").focus();
        return;
      }

      const optionsWrap = document.getElementById("housing-size-options");
      housingSizes[state.housingType].forEach((size) => {
        const sizeButton = document.createElement("button");
        sizeButton.type = "button";
        sizeButton.textContent = size;
        sizeButton.dataset.size = size;
        sizeButton.setAttribute("aria-pressed", "false");

        sizeButton.addEventListener("click", () => {
          [...optionsWrap.querySelectorAll("button")].forEach((item) => {
            const selected = item === sizeButton;
            item.classList.toggle("is-selected", selected);
            item.setAttribute("aria-pressed", String(selected));
          });

          state.housingSize = size;
          finishHousing();
        });

        optionsWrap.appendChild(sizeButton);
      });

      document.getElementById("housing-size-group").hidden = false;
    });
  });

  document.getElementById("housing-area-complete").addEventListener("click", () => {
    const value = document.getElementById("housing-area-input").value.trim();

    if (!value) {
      alert("평수를 입력해 주세요.");
      document.getElementById("housing-area-input").focus();
      return;
    }

    state.housingSize = `${value}평`;
    finishHousing();
  });

  const wallpaperButtons = [...document.querySelectorAll("[data-wallpaper]")];

  wallpaperButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      selectSingle(wallpaperButtons, button);
      state.wallpaper = button.dataset.wallpaper;
      document.getElementById("wallpaper-summary").textContent = state.wallpaper;
      closeSection("wallpaper-header", "wallpaper-content");
    });
  });

  const conditionButtons = [...document.querySelectorAll("[data-condition]")];

  conditionButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      const type = button.dataset.condition;
      const value = button.dataset.value;

      conditionButtons
        .filter((item) => item.dataset.condition === type)
        .forEach((item) => {
          const selected = item === button;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });

      state.condition[type] = value;

      const { condensation, mold, furniture } = state.condition;

      if (condensation && mold && furniture) {
        document.getElementById("condition-summary").textContent =
          `결로 ${condensation} · 곰팡이 ${mold} · 짐 이동 ${furniture}`;
        closeSection("condition-header", "condition-content");
      }
    });
  });

  const additionalButtons = [...document.querySelectorAll("[data-additional]")];

  additionalButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      const value = button.dataset.additional;

      if (value === "없음") {
        state.additional = ["없음"];
        state.additionalDirect = "";

        additionalButtons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });

        document.getElementById("additional-direct-input-group").hidden = true;
        document.getElementById("additional-direct-input").value = "";
        return;
      }

      state.additional = state.additional.filter((item) => item !== "없음");
      const noneButton = additionalButtons.find(
        (item) => item.dataset.additional === "없음"
      );

      if (noneButton) {
        noneButton.classList.remove("is-selected");
        noneButton.setAttribute("aria-pressed", "false");
      }

      const currentlySelected = state.additional.includes(value);

      if (currentlySelected) {
        state.additional = state.additional.filter((item) => item !== value);
        button.classList.remove("is-selected");
        button.setAttribute("aria-pressed", "false");
      } else {
        state.additional.push(value);
        button.classList.add("is-selected");
        button.setAttribute("aria-pressed", "true");
      }

      const directSelected = state.additional.includes("직접 입력");
      document.getElementById("additional-direct-input-group").hidden = !directSelected;

      if (directSelected) {
        document.getElementById("additional-direct-input").focus();
      } else {
        state.additionalDirect = "";
        document.getElementById("additional-direct-input").value = "";
      }
    });
  });

  document.getElementById("additional-complete").addEventListener("click", () => {
    if (state.additional.length === 0) {
      alert("추가 시공을 선택해 주세요.");
      return;
    }

    if (state.additional.includes("직접 입력")) {
      const directValue = document
        .getElementById("additional-direct-input")
        .value.trim();

      if (!directValue) {
        alert("추가 시공 내용을 입력해 주세요.");
        document.getElementById("additional-direct-input").focus();
        return;
      }

      state.additionalDirect = directValue;
    }

    const summaryItems = state.additional.map((item) =>
      item === "직접 입력" ? state.additionalDirect : item
    );

    document.getElementById("additional-summary").textContent =
      summaryItems.join(" · ");

    closeSection("additional-header", "additional-content");
  });

  const addressTypeButtons = [...document.querySelectorAll("[data-address-type]")];

  addressTypeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      selectSingle(addressTypeButtons, button);
      state.addressType = button.dataset.addressType;

      const oldGroup = document.getElementById("old-address-group");
      const newGroup = document.getElementById("new-address-group");

      oldGroup.hidden = state.addressType !== "구주소";
      newGroup.hidden = state.addressType !== "신주소";

      if (state.addressType === "구주소") {
        document.getElementById("district-select").focus();
      } else {
        document.getElementById("new-address-input").focus();
      }
    });
  });

  const districtSelect = document.getElementById("district-select");
  const neighborhoodSelect = document.getElementById("neighborhood-select");

  districtSelect.addEventListener("change", () => {
    state.district = districtSelect.value;
    state.neighborhood = "";

    neighborhoodSelect.innerHTML =
      '<option value="">동을 선택해 주세요.</option>';

    if (!state.district) {
      neighborhoodSelect.disabled = true;
      return;
    }

    neighborhoods[state.district].forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      neighborhoodSelect.appendChild(option);
    });

    neighborhoodSelect.disabled = false;
  });

  neighborhoodSelect.addEventListener("change", () => {
    state.neighborhood = neighborhoodSelect.value;

    if (!state.district || !state.neighborhood) return;

    document.getElementById("location-summary").textContent =
      `${state.district} ${state.neighborhood}`;

    closeSection("location-header", "location-content");
  });

  document.getElementById("new-address-complete").addEventListener("click", () => {
    const value = document.getElementById("new-address-input").value.trim();

    if (!value) {
      alert("신주소를 입력해 주세요.");
      document.getElementById("new-address-input").focus();
      return;
    }

    state.newAddress = value;
    document.getElementById("location-summary").textContent = state.newAddress;
    closeSection("location-header", "location-content");
  });

  const reservationToggle = document.getElementById("reservation-toggle");
  const reservationForm = document.getElementById("reservation-form");

  reservationToggle.addEventListener("click", () => {
    const willOpen = reservationForm.hidden;
    reservationForm.hidden = !willOpen;
    reservationToggle.setAttribute("aria-expanded", String(willOpen));

    if (willOpen) {
      document.getElementById("reservation-name").focus();
    }
  });

  function summaryText(id, fallback = "미선택") {
    const value = document.getElementById(id).textContent.trim();
    return value || fallback;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  document.getElementById("reservation-submit").addEventListener("click", async () => {
    const name = document.getElementById("reservation-name").value.trim();
    const phone = document.getElementById("reservation-phone").value.trim();
    const request = document.getElementById("reservation-request").value.trim();

    if (!name) {
      alert("이름을 입력해 주세요.");
      document.getElementById("reservation-name").focus();
      return;
    }

    if (!phone) {
      alert("연락처를 입력해 주세요.");
      document.getElementById("reservation-phone").focus();
      return;
    }

    const message = [
      "안녕하세요. 바른수유인테리어 상담 예약을 원합니다.",
      "",
      `주거 형태: ${summaryText("housing-summary")}`,
      `벽지: ${summaryText("wallpaper-summary")}`,
      `현장 상태: ${summaryText("condition-summary")}`,
      `추가 시공: ${summaryText("additional-summary")}`,
      `시공 지역: ${summaryText("location-summary")}`,
      "",
      `이름: ${name}`,
      `연락처: ${phone}`,
      `요청사항: ${request || "없음"}`,
      "",
      "희망 방문일:",
      "희망 시간:"
    ].join("\n");

    try {
      await copyText(message);
      alert("예약 내용이 복사되었습니다. 카카오톡에서 붙여넣어 주세요.");
      window.open(KAKAO_URL, "_blank", "noopener");
    } catch (error) {
      alert("복사하지 못했습니다. 다시 시도해 주세요.");
      console.error(error);
    }
  });
});

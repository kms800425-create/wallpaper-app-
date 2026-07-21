"use strict";

/*
  구글 앱스 스크립트 웹 앱 주소
*/
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby07n5Mf0YZCCQ1UcBc7dXLvIh2ACFq6IMm4r5UyK9UEnYAfxOaw8RcbpZQk9aXW23U/exec";

document.addEventListener("DOMContentLoaded", () => {
  const PHONE_URL = "tel:01040084197";
  const KAKAO_URL = "https://open.kakao.com/o/s9MsLsqi";

  const phoneButton = document.getElementById("phone-consultation");
  const kakaoButton = document.getElementById("kakao-consultation");
  const reservationToggle = document.getElementById("reservation-toggle");
  const reservationForm = document.getElementById("reservation-form");
  const reservationSubmit = document.getElementById("reservation-submit");
  const nameInput = document.getElementById("reservation-name");
  const phoneInput = document.getElementById("reservation-phone");
  const requestInput = document.getElementById("reservation-request");

  if (
    !phoneButton ||
    !kakaoButton ||
    !reservationToggle ||
    !reservationForm ||
    !reservationSubmit ||
    !nameInput ||
    !phoneInput ||
    !requestInput
  ) {
    console.error("상담 기능에 필요한 HTML 요소를 찾지 못했습니다.");
    return;
  }

  let selectedConsultationType = "예약상담";
  let saving = false;

  reservationSubmit.textContent = "예약상담 신청하기";

  function summaryText(id, fallback = "미선택") {
    const element = document.getElementById(id);
    if (!element) return fallback;

    const value = element.textContent.trim();
    return value || fallback;
  }

  function parseHousingSummary() {
    const summary = summaryText("housing-summary", "");
    if (!summary) {
      return {
        housingType: "미선택",
        housingSize: "미선택"
      };
    }

    const parts = summary
      .split("·")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      housingType: parts[0] || "미선택",
      housingSize: parts.slice(1).join(" · ") || "미선택"
    };
  }

  function parseConditionSummary() {
    const summary = summaryText("condition-summary", "");

    const result = {
      condensation: "미선택",
      mold: "미선택",
      furniture: "미선택"
    };

    if (!summary) return result;

    const condensationMatch = summary.match(/결로\s*(있음|없음)/);
    const moldMatch = summary.match(/곰팡이\s*(있음|없음)/);
    const furnitureMatch = summary.match(/짐\s*이동\s*(있음|없음)/);

    if (condensationMatch) result.condensation = condensationMatch[1];
    if (moldMatch) result.mold = moldMatch[1];
    if (furnitureMatch) result.furniture = furnitureMatch[1];

    return result;
  }

  function openCustomerForm(type) {
    selectedConsultationType = type;
    reservationForm.hidden = false;
    reservationToggle.setAttribute("aria-expanded", "true");

    if (type === "전화상담") {
      reservationSubmit.textContent = "저장 후 전화 연결하기";
    } else if (type === "카카오상담") {
      reservationSubmit.textContent = "저장 후 카카오 상담 열기";
    } else {
      reservationSubmit.textContent = "예약상담 신청하기";
    }

    reservationForm.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    setTimeout(() => {
      nameInput.focus();
    }, 250);
  }

  function getCustomerData(type) {
    const housing = parseHousingSummary();
    const condition = parseConditionSummary();

    return {
      inquiryType: type,
      housingType: housing.housingType,
      housingSize: housing.housingSize,
      wallpaper: summaryText("wallpaper-summary"),
      condensation: condition.condensation,
      mold: condition.mold,
      furniture: condition.furniture,
      additional: summaryText("additional-summary"),
      location: summaryText("location-summary"),
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      request: requestInput.value.trim() || "없음"
    };
  }

  function validateCustomer() {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name) {
      alert("이름을 입력해 주세요.");
      nameInput.focus();
      return false;
    }

    if (!phone) {
      alert("연락처를 입력해 주세요.");
      phoneInput.focus();
      return false;
    }

    const phoneNumbers = phone.replace(/[^0-9]/g, "");

    if (phoneNumbers.length < 9 || phoneNumbers.length > 11) {
      alert("연락처를 정확하게 입력해 주세요.");
      phoneInput.focus();
      return false;
    }

    return true;
  }

  async function saveCustomerData(type) {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(getCustomerData(type)),
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`저장 요청 실패: ${response.status}`);
    }
  }

  async function processConsultation(type) {
    if (saving || !validateCustomer()) return;

    saving = true;

    const originalText = reservationSubmit.textContent;
    reservationSubmit.disabled = true;
    reservationSubmit.textContent = "저장 중입니다...";

    try {
      await saveCustomerData(type);

      if (type === "전화상담") {
        reservationSubmit.textContent = "저장 완료";
        window.location.href = PHONE_URL;
        return;
      }

      if (type === "카카오상담") {
        reservationSubmit.textContent = "저장 완료";
        window.location.href = KAKAO_URL;
        return;
      }

      alert(
        "예약상담이 정상적으로 접수되었습니다.\n확인 후 빠르게 연락드리겠습니다."
      );

      nameInput.value = "";
      phoneInput.value = "";
      requestInput.value = "";
      reservationForm.hidden = true;
      reservationToggle.setAttribute("aria-expanded", "false");
      reservationSubmit.textContent = "예약상담 신청하기";
    } catch (error) {
      console.error(error);
      alert(
        "상담 내용을 저장하지 못했습니다.\n인터넷 연결을 확인해 주세요."
      );
      reservationSubmit.textContent = originalText;
    } finally {
      saving = false;
      reservationSubmit.disabled = false;
    }
  }

  phoneButton.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openCustomerForm("전화상담");
    },
    true
  );

  kakaoButton.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openCustomerForm("카카오상담");
    },
    true
  );

  reservationToggle.addEventListener(
    "click",
    () => {
      selectedConsultationType = "예약상담";
      reservationForm.hidden = false;
      reservationToggle.setAttribute("aria-expanded", "true");
      reservationSubmit.textContent = "예약상담 신청하기";
    },
    true
  );

  reservationSubmit.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      await processConsultation(selectedConsultationType);
    },
    true
  );
});

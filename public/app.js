const output = document.getElementById("output");

const phoneNumberInput = document.getElementById("phoneNumber");
const sessionIdInput = document.getElementById("sessionId");
const deviceIpInput = document.getElementById("deviceIp");

const btnGenPhone = document.getElementById("btnGenPhone");
const btnCreate = document.getElementById("btnCreate");
const btnGenIp = document.getElementById("btnGenIp");
const btnCheck = document.getElementById("btnCheck");
const btnGetOne = document.getElementById("btnGetOne");
const btnGetAll = document.getElementById("btnGetAll");

function print(data) {
  output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function randomDigits(length) {
  let value = "";
  for (let i = 0; i < length; i += 1) {
    value += Math.floor(Math.random() * 10).toString();
  }
  return value;
}

function generateMockPhone() {
  const countryCode = ["+1", "+44", "+91", "+61"][Math.floor(Math.random() * 4)];
  return `${countryCode}${randomDigits(10)}`;
}

function generateMockIp() {
  const octet = () => Math.floor(Math.random() * 255);
  return `${octet()}.${octet()}.${octet()}.${octet()}`;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data, null, 2));
  }

  return data;
}

btnGenPhone.addEventListener("click", () => {
  phoneNumberInput.value = generateMockPhone();
});

btnGenIp.addEventListener("click", () => {
  deviceIpInput.value = generateMockIp();
});

btnCreate.addEventListener("click", async () => {
  try {
    print("Creating session...");
    const result = await request("/api/verification/sessions", {
      method: "POST",
      body: JSON.stringify({ phoneNumber: phoneNumberInput.value })
    });
    sessionIdInput.value = result?.data?.id || "";
    print(result);
  } catch (error) {
    print(`Create failed: ${error.message}`);
  }
});

btnCheck.addEventListener("click", async () => {
  try {
    if (!sessionIdInput.value) {
      print("Session ID is required before check.");
      return;
    }
    print("Checking verification...");
    const result = await request(`/api/verification/sessions/${sessionIdInput.value}/check`, {
      method: "POST",
      body: JSON.stringify({ deviceIp: deviceIpInput.value })
    });
    print(result);
  } catch (error) {
    print(`Check failed: ${error.message}`);
  }
});

btnGetOne.addEventListener("click", async () => {
  try {
    if (!sessionIdInput.value) {
      print("Session ID is required for lookup.");
      return;
    }
    print("Fetching session...");
    const result = await request(`/api/verification/sessions/${sessionIdInput.value}`);
    print(result);
  } catch (error) {
    print(`Get failed: ${error.message}`);
  }
});

btnGetAll.addEventListener("click", async () => {
  try {
    print("Listing all sessions...");
    const result = await request("/api/verification/sessions");
    print(result);
  } catch (error) {
    print(`List failed: ${error.message}`);
  }
});

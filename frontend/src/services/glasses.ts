
export const getGlassesIP = () => localStorage.getItem('glasses_ip') || '';

export async function pingGlasses() {
  const ip = getGlassesIP();
  if (!ip) return false;
  try {
    const res = await fetch(`http://${ip}/ping`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch (e) {
    console.error('Glasses ping failed:', e);
    return false;
  }
}

export async function sendCmd(cmd: any) {
  const ip = getGlassesIP();
  if (!ip) return;
  try {
    const res = await fetch(`http://${ip}/cmd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cmd),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to send command to glasses:', e);
    return false;
  }
}

export async function updateHUD(data: {
  time: string;
  date: string;
  temp: number;
  city: string;
  projects: number;
  tasks: number;
}) {
  return sendCmd({
    cmd: 'update',
    ...data
  });
}

export async function sendAIResponse(text: string) {
  return sendCmd({ cmd: 'ai', text });
}

export async function sendNotification(text: string) {
  return sendCmd({ cmd: 'notify', text });
}

export async function setScreen(name: 'dashboard' | 'project' | 'ai') {
  return sendCmd({ cmd: 'screen', name });
}

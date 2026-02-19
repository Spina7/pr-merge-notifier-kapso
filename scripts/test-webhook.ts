const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/webhook/github`;

const payload = {
  action: 'closed',
  pull_request: {
    id: 12345,
    number: 1,
    title: 'Add new feature X',
    body: 'This PR adds feature X to improve Y.',
    merged: true,
    html_url: 'https://github.com/owner/repo/pull/1',
    user: {
      login: 'developer-dave'
    },
    head: {
      repo: {
        name: 'awesome-repo',
        owner: {
          login: 'owner'
        }
      }
    }
  },
  repository: {
    full_name: 'owner/awesome-repo'
  }
};

async function testWebhook() {
  console.log('Sending webhook payload...');
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text}`);
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
}

testWebhook();

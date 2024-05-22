<template>
  <div class="data-deletion-request">
    <h1>LetterLock - Request Data Deletion</h1>
    <p>If you would like to request the deletion of your data, please fill out the form below. We will process your request as soon as possible.</p>
    
    <form @submit.prevent="submitRequest">
      <div class="flex justify-between">
        <label for="email">Your Email:</label>
        <input type="email" class="grow" id="email" v-model="email" required />
      </div>
      
      <button type="submit">Submit Request</button>
    </form>
    
    <div v-if="submitted">
      <p>Thank you for your request. We will get back to you shortly.</p>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  data() {
    return {
      email: '',
      submitted: false,
    };
  },
  methods: {
    async submitRequest() {
      // Create the user with the provided email
      await this.createUser(this.email);
      
      // Reset the form
      this.email = '';
      this.message = '';
      this.submitted = true;
    },
    async createUser(email) {
      try {
        const response = await fetch('https://stockwise.app/api/user-create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uuid: uuidv4(),
            email,
            accountType: 20
          }),
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('User created:', data);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  }
};
</script>

<style scoped>
.data-deletion-request {
  max-width: 600px;
  margin: auto;
  padding: 1em;
  background: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: #000;
}

.data-deletion-request h1 {
  font-size: 24px;
  margin-bottom: 1em;
}

.data-deletion-request p {
  font-size: 16px;
  margin-bottom: 1em;
}

.data-deletion-request form {
  display: flex;
  flex-direction: column;
}

.data-deletion-request label {
  margin-bottom: 0.5em;
  font-weight: bold;
}

.data-deletion-request input,
.data-deletion-request textarea {
  margin-bottom: 1em;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.data-deletion-request button {
  padding: 0.5em 1em;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.data-deletion-request button:hover {
  background: #0056b3;
}
</style>

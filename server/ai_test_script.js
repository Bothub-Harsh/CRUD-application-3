const assert = require('assert');

const baseURL = 'http://localhost:5500/api';
let token = null;
let lastCreatedStudentId = null;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {})
  };

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.response = { status: response.status, data };
    throw error;
  }
  
  return { data, status: response.status };
}

async function runTests() {
  console.log('\n--- STARTING COMPLETE CRUD TEST ---');
  await sleep(2000); // Wait for backend to start

  try {
    // 1. & 2. Register / Login
    console.log('Testing Admin Registration and Login...');
    const adminData = { name: 'Admin Test', email: `admin_${Date.now()}@test.com`, password: 'password123' };
    const regRes = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
    
    assert(regRes.data.success === true, 'Admin registration failed');
    token = regRes.data.data.token;
    console.log('✅ Admin Registered successfully and JWT obtained');

    // 4. Create Student
    console.log('Testing Create Student...');
    const studentData = {
      firstName: 'Harsh', lastName: 'Vardhan', email: `harsh_${Date.now()}@test.com`,
      studentId: `STU${Date.now()}`, course: 'B.Tech', department: 'Computer Science',
      year: 3, phone: '9876543210'
    };
    const createRes = await fetchAPI('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    assert(createRes.data.success === true, 'Create student failed');
    lastCreatedStudentId = createRes.data.data._id;
    console.log(`✅ Student created successfully. ID: ${lastCreatedStudentId}`);

    // 5. Read single student
    console.log('Testing Read Student...');
    const getRes = await fetchAPI(`/students/${lastCreatedStudentId}`);
    assert(getRes.data.data.firstName === 'Harsh', 'Read student mis-match');
    console.log('✅ Single Student retrieved successfully');

    // 6. Get all students
    console.log('Testing Get All Students...');
    const allRes = await fetchAPI('/students');
    assert(allRes.data.data.length >= 1, 'Get all returning zero results');
    console.log('✅ All Students retrieved successfully with pagination');

    // 7. Search student
    console.log('Testing Search Student...');
    const searchRes = await fetchAPI('/students?search=Harsh');
    assert(searchRes.data.data.length >= 1, 'Search student failed');
    console.log('✅ Search functional (found "Harsh")');

    // 8. Filter student
    console.log('Testing Filter Student...');
    const filtRes = await fetchAPI('/students?department=Computer%20Science&year=3');
    assert(filtRes.data.data.length >= 1, 'Filter student failed');
    console.log('✅ Filters functional (Department=CS, Year=3)');

    // 9. & 10. Update student
    console.log('Testing Update Student...');
    const updateRes = await fetchAPI(`/students/${lastCreatedStudentId}`, {
      method: 'PUT',
      body: JSON.stringify({ firstName: 'HarshUpdated' })
    });
    assert(updateRes.data.data.firstName === 'HarshUpdated', 'Update student failed');
    console.log('✅ Student updated successfully');

    const statRes = await fetchAPI('/students/stats');
    assert(statRes.data.data.total >= 1, 'Stats failed');
    console.log('✅ Dashboard Statistics generated successfully');

    // 11. & 12. Delete student
    console.log('Testing Delete Student...');
    const delRes = await fetchAPI(`/students/${lastCreatedStudentId}`, {
      method: 'DELETE'
    });
    assert(delRes.data.success === true, 'Delete student failed');
    
    try {
      await fetchAPI(`/students/${lastCreatedStudentId}`);
      throw new Error('Student should have been deleted');
    } catch (e) {
      assert(e.response && e.response.status === 404, 'Status should be 404');
    }
    console.log('✅ Student deleted successfully and no longer exists');

    console.log('\n================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('================================\n');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    if (error.response?.data) console.error('Response Data:', error.response.data);
    process.exit(1);
  }
}

runTests();

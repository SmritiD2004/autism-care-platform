"""
Streamlit Demo Application
Interactive demo for autism-related models and tools
"""

import streamlit as st
import requests
import json

st.set_page_config(
    page_title="Autism Project Demo",
    page_icon="🧩",
    layout="wide"
)

st.title("🧩 Autism Project Demo")
st.markdown("Interactive demonstration of autism-related models and tools")

# Sidebar
st.sidebar.header("Navigation")
page = st.sidebar.selectbox(
    "Choose a page",
    ["Home", "Model Demo", "API Status"]
)

if page == "Home":
    st.header("Welcome")
    st.markdown("""
    This is a demo application showcasing autism-related machine learning models.
    
    ### Features:
    - Model inference and predictions
    - API integration
    - Interactive visualizations
    - Real-time status monitoring
    """)

elif page == "Model Demo":
    st.header("Model Demonstration")
    
    st.subheader("Input Parameters")
    col1, col2 = st.columns(2)
    
    with col1:
        param1 = st.slider("Parameter 1", 0.0, 1.0, 0.5)
        param2 = st.slider("Parameter 2", 0.0, 1.0, 0.5)
    
    with col2:
        param3 = st.number_input("Parameter 3", 0.0, 100.0, 50.0)
        param4 = st.selectbox("Parameter 4", ["Option A", "Option B", "Option C"])
    
    if st.button("Run Prediction"):
        with st.spinner("Processing..."):
            # Example prediction logic
            st.success("Prediction completed!")
            st.json({
                "input": {
                    "param1": param1,
                    "param2": param2,
                    "param3": param3,
                    "param4": param4
                },
                "prediction": "Example result",
                "confidence": 0.85
            })

elif page == "API Status":
    st.header("API Status")
    
    backend_url = st.text_input("Backend URL", "http://localhost:8000")
    
    if st.button("Check Status"):
        try:
            response = requests.get(f"{backend_url}/health", timeout=5)
            if response.status_code == 200:
                st.success("✅ API is healthy")
                st.json(response.json())
            else:
                st.error(f"❌ API returned status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            st.error(f"❌ Could not connect to API: {str(e)}")
            st.info("Make sure the backend server is running on port 8000")

# Footer
st.markdown("---")
st.markdown("**Note**: This is a demo application. See the main README for ethical considerations and usage guidelines.")

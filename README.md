# Autism Project

A comprehensive monorepo for autism-related research, detection, and support tools.

## 📁 Project Structure

```
autism-project/
├── backend/          # FastAPI backend API
├── frontend/         # React + Vite frontend application
├── ml/               # Machine learning models and training
├── streamlit/        # Streamlit demo application
└── README.md         # This file
```

## 🚀 Quick Start

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

API available at `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`

Notes:
- The Vite dev server proxies `/api` to the backend at `http://127.0.0.1:8000`.
- Prototype auth and prototype endpoints live under `/api/proto/*`.

### Streamlit Demo

```bash
cd streamlit
pip install -r requirements.txt
streamlit run app.py
```

Demo available at `http://localhost:8501`

### ML Models

```bash
cd ml
pip install -r requirements.txt
# Use Jupyter notebooks or training scripts
```

## 🛠️ Technology Stack

- **Backend**: FastAPI, Python 3.9+
- **Frontend**: React 18, Vite, Axios
- **ML**: scikit-learn, TensorFlow, PyTorch
- **Demo**: Streamlit
- **Development**: Python, Node.js, npm

## 📋 Development Guidelines

### Code Style
- Python: Follow PEP 8
- JavaScript/React: Use ESLint configuration
- Use meaningful variable names and comments
- Write docstrings for functions and classes

### Git Workflow
- Create feature branches for new work
- Write descriptive commit messages
- Keep commits focused and atomic

### Testing
- Write unit tests for critical functionality
- Test API endpoints
- Test frontend components

## ⚠️ Ethical Considerations and Guidelines

### Data Privacy and Security

1. **Data Protection**
   - All personal data must be anonymized or pseudonymized
   - Implement strict access controls for sensitive data
   - Follow GDPR, HIPAA, and local data protection regulations
   - Never store personally identifiable information (PII) without explicit consent
   - Use encryption for data at rest and in transit

2. **Informed Consent**
   - Obtain explicit, informed consent before collecting any data
   - Clearly explain how data will be used
   - Provide opt-out mechanisms
   - Respect user privacy preferences

3. **Data Minimization**
   - Collect only data that is necessary for the stated purpose
   - Regularly review and purge unnecessary data
   - Implement data retention policies

### Bias and Fairness

1. **Algorithmic Fairness**
   - Actively work to identify and mitigate biases in models
   - Test models across diverse populations and demographics
   - Document known limitations and biases
   - Regularly audit models for fairness metrics

2. **Representative Data**
   - Ensure training datasets are diverse and representative
   - Avoid over-representation of specific groups
   - Consider intersectionality (race, gender, socioeconomic status, etc.)
   - Document dataset composition and limitations

3. **Transparency**
   - Provide clear explanations of how models work
   - Disclose model limitations and uncertainty
   - Make model cards and documentation publicly available
   - Avoid "black box" approaches where possible

### Clinical and Medical Ethics

1. **Not a Replacement for Professional Care**
   - **CRITICAL**: These tools are NOT a substitute for professional medical diagnosis or treatment
   - Always include disclaimers that models are for research/assistance purposes only
   - Encourage users to consult qualified healthcare professionals
   - Never provide definitive medical diagnoses

2. **Responsible Use**
   - Use models as decision support tools, not decision-making tools
   - Highlight uncertainty in predictions
   - Provide confidence intervals or uncertainty estimates
   - Allow for human oversight and intervention

3. **Stigma and Harm Reduction**
   - Avoid language that stigmatizes autism or neurodivergence
   - Use person-first or identity-first language based on community preferences
   - Focus on support and understanding, not "fixing" or "curing"
   - Respect the autism community's perspectives and voices

### Accessibility

1. **Inclusive Design**
   - Ensure interfaces are accessible to users with diverse needs
   - Follow WCAG 2.1 guidelines for web accessibility
   - Provide multiple input/output modalities
   - Test with assistive technologies

2. **User Experience**
   - Design with neurodivergent users in mind
   - Provide clear, simple interfaces
   - Allow customization of sensory inputs (colors, sounds, etc.)
   - Include clear instructions and help text

### Research Ethics

1. **IRB Compliance**
   - Obtain Institutional Review Board (IRB) approval for human subjects research
   - Follow ethical research guidelines (Belmont Report, Declaration of Helsinki)
   - Ensure research benefits outweigh risks

2. **Reproducibility**
   - Document methodologies clearly
   - Share code and data when possible (respecting privacy constraints)
   - Publish negative results and failures
   - Enable peer review and validation

3. **Community Involvement**
   - Involve autistic individuals and their families in research design
   - Listen to and incorporate community feedback
   - Avoid research that harms or stigmatizes the community
   - Share benefits with the community

### Model Deployment and Monitoring

1. **Continuous Monitoring**
   - Monitor model performance in production
   - Track for drift and degradation
   - Set up alerts for unusual patterns
   - Regularly retrain models with new data

2. **Version Control**
   - Maintain version history of models
   - Document changes and improvements
   - Enable rollback to previous versions if needed
   - Track which version is used for each prediction

3. **Error Handling**
   - Gracefully handle errors and edge cases
   - Provide meaningful error messages
   - Log errors for debugging while protecting privacy
   - Never expose sensitive information in error messages

### Legal and Compliance

1. **Regulatory Compliance**
   - Comply with medical device regulations if applicable (FDA, CE marking, etc.)
   - Follow software as a medical device (SaMD) guidelines if relevant
   - Understand liability and legal implications
   - Consult legal experts for compliance

2. **Intellectual Property**
   - Respect third-party licenses and copyrights
   - Clearly license your own work
   - Attribute contributions appropriately

### Reporting and Documentation

1. **Transparency Reports**
   - Document model performance metrics
   - Report on bias audits and fairness assessments
   - Share limitations and known issues
   - Provide usage statistics (anonymized)

2. **User Communication**
   - Clearly communicate what the tool does and doesn't do
   - Provide accessible documentation
   - Offer support channels for questions
   - Respond to concerns and feedback

## 🤝 Contributing

When contributing to this project:

1. Review and follow these ethical guidelines
2. Consider the impact on the autism community
3. Test with diverse users when possible
4. Document your changes thoroughly
5. Participate in code reviews

## 📝 License

[Specify your license here]

## 🙏 Acknowledgments

- The autism community for their insights and feedback
- Researchers and clinicians working in this field
- Open-source contributors

## 📞 Contact and Support

[Add contact information]

## 🔗 Resources

- [Autism Research Ethics Guidelines](https://example.com)
- [AI Ethics Resources](https://example.com)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Remember**: Technology should serve and support people, not replace human judgment, especially in sensitive areas like healthcare and neurodivergence. Always prioritize the well-being and dignity of individuals.

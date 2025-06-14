# Intmax Hackathon Project: Privacy-Preserving Donations

A zero-knowledge-based donation system with optional privacy raffles — built on INTMAX zk-rollup.

This project demonstrates a privacy-preserving donation mechanism using zk-SNARKs on INTMAX, with support for anonymous donations and optional zk-powered raffles. Donors can:

- Contribute funds without revealing their identity or amount
- Enter a privacy raffle as part of their donation (opt-in)
- Verify fair selection of raffle winners without leaking user data

## Structure

- `web`: Frontend application for donations and raffles
- `raffle-prover-server`: Backend service for generating zk-SNARK proofs for raffle entries
- `deps`: INTMAX SDK libraries and utilities

import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from './Display';
import AdminDashboard from '../admin/AdminDashboard';
import AdminAuth from '../admin/AdminAuth';
import BookingDetailsPage from '../pages/BookingDetailsPage';
